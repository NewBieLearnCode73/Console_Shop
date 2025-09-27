import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '../entity/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ProductResponseDto } from '../dto/response/product-response.dto';
import { isUUID } from 'class-validator';
import {
  CreateProductRequestDto,
  FilterProductRequestDto,
  UpdateProductRequestDto,
  UpdateProductStatusRequestDto,
} from '../dto/request/product-request.dto';
import { Category } from '../entity/category.entity';
import { generateSlug } from 'src/utils/main_helper';
import { Brand } from '../entity/brand.entity';
import { PaginationRequestDto } from '../../../utils/pagination/pagination_dto';
import { PaginationResult } from 'src/utils/pagination/pagination_result';
import { ProductVariantService } from './product_variant.service';
import { ProductStatus } from 'src/constants/product_status.enum';
import { ProductType } from 'src/constants/product_type.enum';
import { Stock } from '../entity/stock.entity';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    private readonly productVariantService: ProductVariantService,
    private readonly dataSource: DataSource,
  ) {}

  //****************** FOR USER AND GUEST - START **********************//
  async findAllProductsForUsersAndGuests(
    paginationRequestDto: PaginationRequestDto,
  ) {
    const { page, limit, order, sortBy } = paginationRequestDto;

    const [response, total] = await this.productRepository.findAndCount({
      where: { status: ProductStatus.ACTIVE },
      relations: ['category', 'brand', 'variants', 'variants.images'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [sortBy]: order,
      },
    });

    const products = response.map((product) =>
      plainToInstance(ProductResponseDto, {
        id: product.id,
        name: product.name,
        description: product.description,
        product_type: product.product_type,
        weight: product.weight,
        status: product.status,
        slug: product.slug,
        seo_title: product.seo_title,
        seo_description: product.seo_description,
        category_id: product.category?.id,
        brand_id: product.brand?.id,
        image:
          product.variants?.[0]?.images?.filter((image) => image.is_main)?.[0]
            .product_url || null,
        price: Math.min(...product.variants.map((v) => v.price)) || null,
      }),
    );

    return PaginationResult<ProductResponseDto>(products, total, page, limit);
  }

  async findProductVariantsForUsersAndGuests(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug, status: ProductStatus.ACTIVE },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.productVariantService.getAllVariantsByProductId(product.id);
  }

  async filterProductsForUsersAndGuests(
    filterProductRequestDto: FilterProductRequestDto,
    paginationRequestDto: PaginationRequestDto,
  ) {
    const { categorySlug, brandSlug, productType } = filterProductRequestDto;
    const { page, limit, order, sortBy } = paginationRequestDto;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.images', 'images')
      .where('product.status = :status', { status: ProductStatus.ACTIVE });

    if (categorySlug) {
      query.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    if (brandSlug) {
      query.andWhere('brand.slug = :brandSlug', { brandSlug });
    }

    if (productType) {
      query.andWhere('product.product_type = :productType', { productType });
    }

    const [response, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(`product.${sortBy}`, order)
      .getManyAndCount();

    const products = response.map((product) =>
      plainToInstance(ProductResponseDto, {
        id: product.id,
        name: product.name,
        description: product.description,
        product_type: product.product_type,
        weight: product.weight,
        status: product.status,
        slug: product.slug,
        seo_title: product.seo_title,
        seo_description: product.seo_description,
        category_id: product.category?.id,
        brand_id: product.brand?.id,
        image: product.variants?.[0]?.images?.[0]?.product_url || null,
        price: Math.min(...product.variants.map((v) => v.price)) || null,
      }),
    );

    return PaginationResult<ProductResponseDto>(products, total, page, limit);
  }

  //****************** FOR USER AND GUEST - END **********************//

  //******************* FOR MANAGER or ADMIN*******************/
  async findAll(
    paginationRequestDto: PaginationRequestDto,
    status?: ProductStatus,
  ) {
    const { page, limit, order, sortBy } = paginationRequestDto;

    const [response, total] = await this.productRepository.findAndCount({
      relations: ['category', 'brand', 'variants', 'variants.images'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [sortBy]: order,
      },
      where: status ? { status } : {},
    });

    const products = response.map((product) =>
      plainToInstance(ProductResponseDto, {
        id: product.id,
        name: product.name,
        description: product.description,
        product_type: product.product_type,
        weight: product.weight,
        status: product.status,
        slug: product.slug,
        seo_title: product.seo_title,
        seo_description: product.seo_description,
        category_id: product.category?.id,
        brand_id: product.brand?.id,
      }),
    );

    return PaginationResult<ProductResponseDto>(products, total, page, limit);
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
      throw new NotFoundException('Product not found');
    }

    return plainToInstance(ProductResponseDto, {
      id: product.id,
      name: product.name,
      description: product.description,
      product_type: product.product_type,
      weight: product.weight,
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
      throw new NotFoundException('Product not found');
    }

    return plainToInstance(ProductResponseDto, {
      id: product.id,
      name: product.name,
      description: product.description,
      product_type: product.product_type,
      weight: product.weight,
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

    product.slug = generateSlug(product.name);

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
      weight: product.weight,
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

    const { brand_id, category_id, name, ...rest } = updateProductRequestDto;
    Object.assign(product, rest);

    if (name && name !== product.name) {
      product.slug = generateSlug(name);
      product.name = name;
    }

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
      weight: product.weight,
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
      relations: ['category', 'brand', 'variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newStatus = updateProductStatus.status;
    const currentStatus = product.status;

    switch (newStatus) {
      case ProductStatus.ACTIVE:
        if (currentStatus !== ProductStatus.INACTIVE) {
          throw new BadRequestException('Can only activate from INACTIVE');
        }
        const hasStock = await this.productVariantService.hasAvailableStock(
          product.id,
        );
        if (!hasStock) {
          throw new BadRequestException(
            'Cannot activate product without available stock',
          );
        }
        break;

      case ProductStatus.INACTIVE:
        if (currentStatus !== ProductStatus.ACTIVE) {
          throw new BadRequestException('Can only inactivate from ACTIVE');
        }
        break;

      case ProductStatus.ARCHIVED:
        if (
          currentStatus !== ProductStatus.ACTIVE &&
          currentStatus !== ProductStatus.INACTIVE
        ) {
          throw new BadRequestException(
            'Can only archive from ACTIVE or INACTIVE',
          );
        }
        break;

      case ProductStatus.OUT_OF_STOCK:
        if (
          product.product_type !== ProductType.DEVICE &&
          product.product_type !== ProductType.CARD_PHYSICAL
        ) {
          throw new BadRequestException(
            'OUT_OF_STOCK only applies to DEVICE or CARD_PHYSICAL',
          );
        }
        if (currentStatus === ProductStatus.ARCHIVED) {
          throw new BadRequestException(
            'Cannot mark archived product as out of stock',
          );
        }

        await this.productVariantService.setAllVariantsToZero(product.id);
        break;

      default:
        throw new BadRequestException('Invalid status transition');
    }

    product.status = newStatus;
    await this.productRepository.save(product);

    return plainToInstance(ProductResponseDto, {
      id: product.id,
      name: product.name,
      description: product.description,
      product_type: product.product_type,
      weight: product.weight,
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
