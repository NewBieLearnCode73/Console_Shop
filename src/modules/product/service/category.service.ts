import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entity/category.entity';
import { IsNull, Repository } from 'typeorm';
import {
  CreateCategoryRequestDto,
  UpdateCategoryRequestDto,
} from '../dto/request/category-request.dto';
import { plainToInstance } from 'class-transformer';
import {
  CategoryResponseDto,
  CreateCategoryResponseDto,
} from '../dto/response/category-response.dto';
import { isUUID } from 'class-validator';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateSlugByName } from 'src/utils/main_helper';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findByCategoryById(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return plainToInstance(CategoryResponseDto, category);
  }

  async findAllCategories() {
    const categories = await this.categoryRepository.find({
      where: { parent: IsNull() },
      relations: ['children'],
    });

    return plainToInstance(CategoryResponseDto, categories);
  }

  async createCategory(createCategoryRequestDto: CreateCategoryRequestDto) {
    const category = this.categoryRepository.create(createCategoryRequestDto);
    category.slug = generateSlugByName(category.name);

    if (createCategoryRequestDto.parent_id) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: createCategoryRequestDto.parent_id },
      });
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }
      category.parent = parentCategory;
    }

    await this.categoryRepository.save(category);
    return plainToInstance(CreateCategoryResponseDto, category);
  }

  async updateCategory(
    id: string,
    updateCategoryRequestDto: UpdateCategoryRequestDto,
  ) {
    if (!isUUID(id) || !isUUID(updateCategoryRequestDto.parent_id)) {
      throw new BadRequestException('Invalid UUID');
    }

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if (updateCategoryRequestDto.parent_id) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: updateCategoryRequestDto.parent_id },
      });
      if (!isUUID(updateCategoryRequestDto.parent_id)) {
        throw new BadRequestException('Invalid parentId UUID');
      }

      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }
      category.parent = parentCategory;
    }

    this.categoryRepository.merge(category, updateCategoryRequestDto);
    category.slug = generateSlugByName(category.name);
    await this.categoryRepository.save(category);
    return plainToInstance(CategoryResponseDto, category);
  }

  async deleteCategory(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'products'],
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        'Category has subcategories. Please remove them first!',
      );
    }

    if (category.products && category.products.length > 0) {
      throw new BadRequestException(
        'Category has products. Please remove them first!',
      );
    }

    await this.categoryRepository.remove(category);
    return plainToInstance(CategoryResponseDto, category);
  }
}
