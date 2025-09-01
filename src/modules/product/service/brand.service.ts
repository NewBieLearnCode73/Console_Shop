import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from '../entity/brand.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BrandResponseDto } from '../dto/response/brand-response.dto';
import { isUUID } from 'class-validator';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateBrandRequestDto,
  UpdateBrandRequestDto,
} from '../dto/request/brand-request.dto';
import { generateSlug } from 'src/utils/main_helper';
import { PaginationRequestDto } from '../../../utils/pagination/pagination_dto';
import { PaginationResult } from 'src/utils/pagination/pagination_result';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async findAllBrands(paginationRequestDto: PaginationRequestDto) {
    const { page, limit } = paginationRequestDto;

    const [response, total] = await this.brandRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const brands = plainToInstance(BrandResponseDto, response);
    return PaginationResult<BrandResponseDto>(brands, total, page, limit);
  }

  async findBrandById(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid brand ID');
    }
    const brand = await this.brandRepository.findOneBy({ id });
    return plainToInstance(BrandResponseDto, brand);
  }

  async findBrandByName(name: string) {
    const brand = await this.brandRepository.findOneBy({ name });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return plainToInstance(BrandResponseDto, brand);
  }

  async createBrand(createBrandRequestDto: CreateBrandRequestDto) {
    const brand = this.brandRepository.create(createBrandRequestDto);

    brand.slug = generateSlug(brand.name);

    await this.brandRepository.save(brand);
    return plainToInstance(BrandResponseDto, brand);
  }

  async updateBrand(id: string, updateBrandRequestDto: UpdateBrandRequestDto) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid brand ID!');
    }

    const brand = await this.brandRepository.findOneBy({ id });
    if (!brand) {
      throw new NotFoundException('Brand not found!');
    }

    this.brandRepository.merge(brand, updateBrandRequestDto);
    brand.slug = generateSlug(brand.name);

    await this.brandRepository.save(brand);
    return plainToInstance(BrandResponseDto, brand);
  }

  async deleteBrand(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid brand ID!');
    }

    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!brand) {
      throw new NotFoundException('Brand not found!');
    }

    if (brand.products.length > 0) {
      throw new BadRequestException(
        'Cannot delete brand with associated products',
      );
    }

    await this.brandRepository.remove(brand);
  }
}
