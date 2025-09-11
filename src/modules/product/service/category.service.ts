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
  CategoryWithNotChildResponseDto,
  CreateCategoryResponseDto,
} from '../dto/response/category-response.dto';
import { isUUID } from 'class-validator';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateSlug } from 'src/utils/main_helper';
import { PaginationRequestDto } from '../../../utils/pagination/pagination_dto';
import { PaginationResult } from 'src/utils/pagination/pagination_result';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAllNotChildCategories(paginationRequestDto: PaginationRequestDto) {
    const { page, limit, sortBy, order } = paginationRequestDto;

    const [categories, total] = await this.categoryRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [sortBy]: order,
      },
    });

    const response = categories.map((category) =>
      plainToInstance(CategoryWithNotChildResponseDto, category),
    );

    return PaginationResult<CategoryWithNotChildResponseDto>(
      response,
      total,
      page,
      limit,
    );
  }

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

  async findByCategorySlug(slug: string) {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return plainToInstance(CategoryResponseDto, category);
  }

  async findAllCategories(paginationRequestDto: PaginationRequestDto) {
    const { page, limit, sortBy, order } = paginationRequestDto;

    const [categories, total] = await this.categoryRepository.findAndCount({
      where: { parent: IsNull() },
      relations: ['children'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [sortBy]: order,
      },
    });

    const response = plainToInstance(CategoryResponseDto, categories);

    return PaginationResult<CategoryResponseDto>(response, total, page, limit);
  }

  async createCategory(createCategoryRequestDto: CreateCategoryRequestDto) {
    const category = this.categoryRepository.create(createCategoryRequestDto);
    category.slug = generateSlug(category.name);

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
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid Category ID');
    }

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (
      updateCategoryRequestDto.name &&
      updateCategoryRequestDto.name !== category.name
    ) {
      category.slug = generateSlug(updateCategoryRequestDto.name);
    }

    console.log('Category slug: ', category.slug);

    if (
      updateCategoryRequestDto.parent_id ||
      updateCategoryRequestDto.parent_id === ''
    ) {
      // nếu có parent_id thì validate
      if (!isUUID(updateCategoryRequestDto.parent_id)) {
        throw new BadRequestException('Invalid Parent ID');
      }

      const parentCategory = await this.categoryRepository.findOne({
        where: { id: updateCategoryRequestDto.parent_id },
      });

      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }

      category.parent = parentCategory;
    } else {
      category.parent = null;
    }

    this.categoryRepository.merge(category, updateCategoryRequestDto);

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
