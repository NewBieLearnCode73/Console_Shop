import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '../entity/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ProductResponseDto } from '../dto/response/product-response.dto';
import { isUUID } from 'class-validator';
import {
  CreateProductRequestDto,
  UpdateProductRequestDto,
  UpdateProductStatusRequestDto,
} from '../dto/request/product-request.dto';
import { Category } from '../entity/category.entity';
import { generateSlugByName } from 'src/utils/main_helper';
import { Brand } from '../entity/brand.entity';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async findAll() {
    const products = await this.productRepository.find({
      relations: ['category', 'brand'],
    });

    return products.map((product) =>
      plainToInstance(ProductResponseDto, {
        id: product.id,
        name: product.name,
        description: product.description,
        product_type: product.product_type,
        status: product.status,
        slug: product.slug,
        seo_title: product.seo_title,
        seo_description: product.seo_description,
        category_id: product.category?.id,
        brand_id: product.brand?.id,
      }),
    );
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid Product ID');
    }

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'brand'],
    });

    if (!product) {
      return null;
    }

    return plainToInstance(ProductResponseDto, {
      id: product.id,
      name: product.name,
      description: product.description,
      product_type: product.product_type,
      status: product.status,
      slug: product.slug,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      category_id: product.category?.id,
      brand_id: product.brand?.id,
    });
  }

  async findBySlug(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category', 'brand'],
    });

    if (!product) {
      return null;
    }

    return plainToInstance(ProductResponseDto, {
      id: product.id,
      name: product.name,
      description: product.description,
      product_type: product.product_type,
      status: product.status,
      slug: product.slug,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      category_id: product.category?.id,
      brand_id: product.brand?.id,
    });
  }

  async createProduct(createProductRequestDto: CreateProductRequestDto) {
    const product = this.productRepository.create(createProductRequestDto);

    if (
      !isUUID(createProductRequestDto.category_id) ||
      !isUUID(createProductRequestDto.brand_id)
    ) {
      throw new BadRequestException('Invalid UUID for category or brand');
    }

    product.slug = generateSlugByName(product.name);

    const category = await this.categoryRepository.findOne({
      where: { id: createProductRequestDto.category_id },
    });

    const brand = await this.brandRepository.findOne({
      where: { id: createProductRequestDto.brand_id },
    });

    if (!category || !brand) {
      throw new BadRequestException('Invalid category or brand ID');
    }

    product.category = category;
    product.brand = brand;

    await this.productRepository.save(product);
    return plainToInstance(ProductResponseDto, {
      id: product.id,
      name: product.name,
      description: product.description,
      product_type: product.product_type,
      status: product.status,
      slug: product.slug,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      category_id: product.category?.id,
      brand_id: product.brand?.id,
    });
  }

  async updateProduct(
    id: string,
    updateProductRequestDto: UpdateProductRequestDto,
  ) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid Product ID');
    }

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'brand'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { brand_id, category_id, ...rest } = updateProductRequestDto;
    Object.assign(product, rest);

    if (category_id) {
      if (!isUUID(category_id)) {
        throw new BadRequestException('Invalid categoryId UUID');
      }
      const category = await this.categoryRepository.findOne({
        where: { id: category_id },
      });
      if (!category) {
        throw new BadRequestException('Invalid category ID');
      }
      product.category = category;
    }

    if (brand_id) {
      if (!isUUID(brand_id)) {
        throw new BadRequestException('Invalid brandId UUID');
      }
      const brand = await this.brandRepository.findOne({
        where: { id: brand_id },
      });
      if (!brand) {
        throw new BadRequestException('Invalid brand ID');
      }
      product.brand = brand;
    }

    await this.productRepository.save(product);

    return plainToInstance(ProductResponseDto, {
      id: product.id,
      name: product.name,
      description: product.description,
      product_type: product.product_type,
      status: product.status,
      slug: product.slug,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      category_id: product.category?.id,
      brand_id: product.brand?.id,
    });
  }

  async updateProductStatus(
    id: string,
    updateProductStatus: UpdateProductStatusRequestDto,
  ) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid Product ID');
    }

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'brand'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.status = updateProductStatus.status;
    await this.productRepository.save(product);

    return plainToInstance(ProductResponseDto, {
      id: product.id,
      name: product.name,
      description: product.description,
      product_type: product.product_type,
      status: product.status,
      slug: product.slug,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      category_id: product.category?.id,
      brand_id: product.brand?.id,
    });
  }

  async deleteProduct(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid Product ID');
    }

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.variants && product.variants.length > 0) {
      throw new BadRequestException(
        'Product has variants and cannot be deleted!',
      );
    }

    await this.productRepository.remove(product);
  }
}
