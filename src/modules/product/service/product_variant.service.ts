import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, ILike, In, Not, Repository } from 'typeorm';
import { ProductVariant } from '../entity/product_variant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductImage } from '../entity/product_image.entity';
import { Product } from '../entity/product.entity';
import { Stock } from '../entity/stock.entity';
import { DigitalKey } from '../entity/digital_key.entity';
import {
  CreatePhysicalVariantDto,
  CreateProductVariantDto,
  SearchProductVariantRequestDto,
} from '../dto/request/product_variant-request.dto';
import { SupabaseService } from '../../supabase/service/supabase.service';
import { generateSlug, processCsvFile } from 'src/utils/main_helper';
import { isUUID } from 'class-validator';
import { ListImagesIdRequestDto } from '../dto/request/product_image-request.dto';
import {
  UpdateVariantDto,
  ListKeepUrlImagesRequestDto,
} from '../dto/request/product_variant-request.dto';
import { KeyGame } from 'src/interfaces/keygamge';
import { plainToInstance } from 'class-transformer';
import { ProductVariantSearchResponseDto } from '../dto/response/product_variant-response.dto';
import { ProductStatus } from 'src/constants/product_status.enum';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(DigitalKey)
    private readonly digitalKeyRepository: Repository<DigitalKey>,
    private readonly supabaseService: SupabaseService,
    private readonly dataSource: DataSource,
  ) {}

  async getVariantByIdWithCostPrice(id: string) {
    return this.productVariantRepository.findOne({
      where: { id: id },
      relations: ['product', 'stock', 'images'],
    });
  }

  async getVariantById(id: string) {
    const variant = await this.productVariantRepository.findOne({
      where: { id: id },
      relations: ['product', 'stock', 'images'],
    });
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    // Exclude cost_price from the response
    const { cost_price, ...variantWithoutCostPrice } = variant;
    return variantWithoutCostPrice;
  }

  async getVariantBySlugWithCostPrice(slug: string) {
    const variant = await this.productVariantRepository.findOne({
      where: { slug: slug },
      relations: ['product', 'stock', 'images'],
    });
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    return variant;
  }

  async getVariantBySlug(slug: string) {
    const variant = await this.productVariantRepository.findOne({
      where: { slug: slug },
      relations: ['product', 'stock', 'images'],
    });
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    // Exclude cost_price from the response
    const { cost_price, ...variantWithoutCostPrice } = variant;
    return variantWithoutCostPrice;
  }

  async getAllVariantsByProductId(id: string) {
    const variants = await this.productVariantRepository.find({
      where: { product: { id: id } },
      relations: ['product', 'images'],
    });

    if (!variants || variants.length === 0) {
      throw new NotFoundException('No variants found for this product');
    }

    return variants.map((variant) => {
      const { cost_price, ...variantWithoutCostPrice } = variant;
      return variantWithoutCostPrice;
    });
  }

  async getAllVariantsByProductIdWithCostPrice(id: string) {
    return await this.productVariantRepository.find({
      where: { product: { id: id } },
      relations: ['product', 'images'],
    });
  }

  async search(searchDto: SearchProductVariantRequestDto) {
    const { query, limitProduct, limitVariant } = searchDto;

    const productSearch = await this.productRepository.find({
      where: { name: ILike(`%${query}%`), status: ProductStatus.ACTIVE },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: limitProduct,
    });

    const variantSearch = await this.productVariantRepository.find({
      where: {
        variant_name: ILike(`%${query}%`),
        product: { status: ProductStatus.ACTIVE },
      },
      relations: ['product'],
      select: {
        id: true,
        variant_name: true,
        slug: true,
      },
      take: limitVariant,
    });

    return plainToInstance(ProductVariantSearchResponseDto, {
      products: productSearch,
      variants: variantSearch,
    });
  }

  async getSimilarVariants(variantId: string, limit: number = 8) {
    const currentVariant = await this.productVariantRepository.findOne({
      where: { id: variantId },
      relations: ['product', 'product.category', 'product.brand'],
    });

    if (!currentVariant) {
      throw new BadRequestException('Product variant not found');
    }

    const { product } = currentVariant;
    const categoryId = product.category?.id;
    const brandId = product.brand?.id;
    const productType = product.product_type;

    const queryBuilder = this.productVariantRepository
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('variant.images', 'images')
      .leftJoinAndSelect('variant.stock', 'stock')
      .where('variant.id != :currentVariantId', {
        currentVariantId: variantId,
      })
      .andWhere('product.product_type = :productType', { productType });

    //Same category and same brand
    const sameCategoryAndBrandQuery = queryBuilder
      .clone()
      .andWhere('category.id = :categoryId', { categoryId })
      .andWhere('brand.id = :brandId', { brandId })
      .limit(Math.ceil(limit * 0.5)); // 50% of results

    //Same category, different brand
    const sameCategoryQuery = queryBuilder
      .clone()
      .andWhere('category.id = :categoryId', { categoryId })
      .andWhere('brand.id != :brandId', { brandId })
      .limit(Math.ceil(limit * 0.3)); // 30% of results

    //Same brand, different category
    const sameBrandQuery = queryBuilder
      .clone()
      .andWhere('brand.id = :brandId', { brandId })
      .andWhere('category.id != :categoryId', { categoryId })
      .limit(Math.ceil(limit * 0.2)); // 20% of results

    const [sameCategoryAndBrand, sameCategory, sameBrand] = await Promise.all([
      sameCategoryAndBrandQuery.getMany(),
      sameCategoryQuery.getMany(),
      sameBrandQuery.getMany(),
    ]);

    // Combine results with priority order
    const similarVariants = [
      ...sameCategoryAndBrand,
      ...sameCategory,
      ...sameBrand,
    ].slice(0, limit);

    return similarVariants.map((variant) => ({
      id: variant.id,
      variant_name: variant.variant_name,
      slug: variant.slug,
      sku: variant.sku,
      price: variant.price,
      discount: variant.discount,
      color: variant.color,
      other_attributes: variant.other_attributes,
      images: variant.images,
    }));
  }

  async createPhysicalVariant(
    createVariantDto: CreatePhysicalVariantDto,
    mainImage: Express.Multer.File,
    galleryImages: Express.Multer.File[],
  ) {
    const {
      product_id,
      variant_name,
      sku,
      price,
      color,
      cost_price,
      other_attributes,
      quantity,
      ...rest
    } = createVariantDto;

    if (!isUUID(product_id)) {
      throw new BadRequestException('Invalid product ID');
    }

    if (
      await this.productVariantRepository.exists({
        where: { sku },
      })
    ) {
      throw new BadRequestException('SKU already exists');
    }

    if (!mainImage) {
      throw new BadRequestException('Main image is required');
    }

    if (!Array.isArray(galleryImages)) {
      throw new BadRequestException('Gallery images must be an array');
    }

    const product = await this.productRepository.findOneBy({ id: product_id });
    if (!product) {
      throw new BadRequestException('Invalid product ID');
    }

    // Parse other_attributes if it's a string
    let parsedOtherAttributes: Record<string, unknown>;
    try {
      parsedOtherAttributes =
        typeof other_attributes === 'string'
          ? (JSON.parse(other_attributes) as Record<string, unknown>)
          : other_attributes;
    } catch {
      throw new BadRequestException('Invalid other_attributes format');
    }

    // Track uploaded files for rollback
    const uploadedUrls: string[] = [];

    try {
      return await this.dataSource.transaction(async (manager) => {
        const productVariant = manager.create(
          this.productVariantRepository.target,
          {
            product: product,
            variant_name: variant_name,
            slug: generateSlug(variant_name),
            cost_price: cost_price,
            sku: sku,
            price: price,
            color: color,
            other_attributes: parsedOtherAttributes,
          },
        );

        if (rest.discount) {
          productVariant.discount = rest.discount;
        }

        const savedVariant = await manager.save(productVariant);

        const stock = manager.create(this.stockRepository.target, {
          quantity: quantity,
          variant: savedVariant,
        });
        await manager.save(stock);

        // Upload Supabase
        const mainImageUrl =
          await this.supabaseService.uploadProductVariantMainImage(
            mainImage,
            savedVariant.id,
          );
        uploadedUrls.push(mainImageUrl);

        const galleryImageUrls =
          await this.supabaseService.uploadProductVariantGallaryImage(
            galleryImages,
            savedVariant.id,
          );
        uploadedUrls.push(...galleryImageUrls);

        // Save DB record for images
        const mainImageEntity = manager.create(
          this.productImageRepository.target,
          {
            is_main: true,
            product_url: mainImageUrl,
            productVariant: savedVariant,
          },
        );
        await manager.save(mainImageEntity);

        if (galleryImageUrls.length > 0) {
          const galleryImageEntities = galleryImageUrls.map((url) =>
            manager.create(this.productImageRepository.target, {
              is_main: false,
              product_url: url,
              productVariant: savedVariant,
            }),
          );
          await manager.save(galleryImageEntities);
        }

        return await manager.findOne(this.productVariantRepository.target, {
          where: { id: savedVariant.id },
          relations: ['product', 'images', 'stock'],
        });
      });
    } catch (error) {
      // Rollback Supabase
      if (uploadedUrls.length > 0) {
        await this.supabaseService.deleteProductVariantImages(uploadedUrls);
      }
      throw error;
    }
  }

  async createDigitalVariant(
    createProductVariantDto: CreateProductVariantDto,
    mainImage: Express.Multer.File,
    galleryImages: Express.Multer.File[],
    digitalKeysCsv: Express.Multer.File,
  ) {
    if (!digitalKeysCsv || digitalKeysCsv.mimetype !== 'text/csv') {
      throw new BadRequestException('Invalid CSV file');
    }

    const {
      product_id,
      variant_name,
      sku,
      price,
      other_attributes,
      cost_price,
      ...rest
    } = createProductVariantDto;

    if (!isUUID(product_id)) {
      throw new BadRequestException('Invalid product ID');
    }

    if (
      await this.productVariantRepository.exists({
        where: { sku },
      })
    ) {
      throw new BadRequestException('SKU already exists');
    }

    if (!mainImage) {
      throw new BadRequestException('Main image is required');
    }

    if (!Array.isArray(galleryImages)) {
      throw new BadRequestException('Gallery images must be an array');
    }

    const product = await this.productRepository.findOneBy({
      id: product_id,
    });

    if (!product) {
      throw new BadRequestException('Invalid product ID');
    }

    // Parse other_attributes
    let parsedOtherAttributes: Record<string, unknown>;
    try {
      parsedOtherAttributes =
        typeof other_attributes === 'string'
          ? (JSON.parse(other_attributes) as Record<string, unknown>)
          : other_attributes;
    } catch {
      throw new BadRequestException('Invalid other_attributes format');
    }

    // Parse CSV file ()
    const digitalKeys: KeyGame[] = await processCsvFile(digitalKeysCsv);

    // Track uploaded URLs
    const uploadedUrls: string[] = [];

    try {
      return await this.dataSource.transaction(async (manager) => {
        const productVariant = manager.create(
          this.productVariantRepository.target,
          {
            product,
            variant_name,
            cost_price,
            slug: generateSlug(variant_name),
            sku,
            price,
            other_attributes: parsedOtherAttributes,
          },
        );

        if (rest.discount) {
          productVariant.discount = rest.discount;
        }

        const savedVariant = await manager.save(productVariant);

        const stock = manager.create(this.stockRepository.target, {
          quantity: digitalKeys.length,
          variant: savedVariant,
        });
        await manager.save(stock);

        console.log(`Total digital keys: ${digitalKeys.length}`);

        // Upload image to Supabase
        const mainImageUrl =
          await this.supabaseService.uploadProductVariantMainImage(
            mainImage,
            savedVariant.id,
          );
        uploadedUrls.push(mainImageUrl);

        const galleryImageUrls =
          await this.supabaseService.uploadProductVariantGallaryImage(
            galleryImages,
            savedVariant.id,
          );
        uploadedUrls.push(...galleryImageUrls);

        // Save image to DB
        const mainImageEntity = manager.create(
          this.productImageRepository.target,
          {
            is_main: true,
            product_url: mainImageUrl,
            productVariant: savedVariant,
          },
        );
        await manager.save(mainImageEntity);

        if (galleryImageUrls.length > 0) {
          const galleryImageEntities = galleryImageUrls.map((url) =>
            manager.create(this.productImageRepository.target, {
              is_main: false,
              product_url: url,
              productVariant: savedVariant,
            }),
          );
          await manager.save(galleryImageEntities);
        }

        // Save digital key
        const allDigitalKey = digitalKeys.map((key) =>
          manager.create(this.digitalKeyRepository.target, {
            hash_key_code: key.hash,
            key_code: key.encrypted,
            variant: savedVariant,
          }),
        );
        await manager.save(allDigitalKey);

        return await manager.findOne(this.productVariantRepository.target, {
          where: { id: savedVariant.id },
          relations: ['product', 'images', 'stock'],
        });
      });
    } catch (error) {
      // Rollback Supabase if transaction failed
      if (uploadedUrls.length > 0) {
        await this.supabaseService.deleteProductVariantImages(uploadedUrls);
      }
      throw error;
    }
  }

  async addingDigitalKeys(variantId: string, file: Express.Multer.File) {
    const digitalKeys = await processCsvFile(file);

    return await this.dataSource.transaction(async (manager) => {
      const variant = await manager.findOne(
        this.productVariantRepository.target,
        { where: { id: variantId } },
      );

      if (!variant) {
        throw new NotFoundException(`Variant with id ${variantId} not found`);
      }

      const hashesFromFile = digitalKeys.map((k) => k.hash);

      const existingKeys = await manager.find(
        this.digitalKeyRepository.target,
        {
          where: {
            variant: { id: variantId },
            hash_key_code: In(hashesFromFile),
          },
          select: ['hash_key_code'],
        },
      );

      const existingHashes = new Set(existingKeys.map((k) => k.hash_key_code));

      const newKeys = digitalKeys.filter((k) => !existingHashes.has(k.hash));

      const digitalKeyEntities = newKeys.map((key) =>
        manager.create(this.digitalKeyRepository.target, {
          hash_key_code: key.hash,
          key_code: key.encrypted,
          variant,
        }),
      );

      if (digitalKeyEntities.length > 0) {
        await manager.save(digitalKeyEntities);
        await manager.increment(
          this.stockRepository.target,
          { variant: { id: variantId } },
          'quantity',
          digitalKeyEntities.length,
        );
      }
    });
  }

  async updateVariant(id: string, updateVariantDto: UpdateVariantDto) {
    return await this.dataSource.transaction(async (manager) => {
      const variant = await manager.findOne(
        this.productVariantRepository.target,
        {
          where: { id },
        },
      );

      if (!variant) {
        throw new NotFoundException(`Variant with id ${id} not found`);
      }

      if (updateVariantDto.slug) {
        const existSlug = await manager.findOne(
          this.productVariantRepository.target,
          {
            where: { slug: updateVariantDto.slug, id: Not(id) }, // Check for existing slug (Not include this variant )
          },
        );

        if (existSlug) {
          throw new BadRequestException(
            `Slug '${updateVariantDto.slug}' is already in use`,
          );
        }
      }

      if (updateVariantDto.variant_name) {
        const existName = await manager.findOne(
          this.productVariantRepository.target,
          {
            where: { variant_name: updateVariantDto.variant_name, id: Not(id) },
          },
        );

        if (existName) {
          throw new BadRequestException(
            `Variant name '${updateVariantDto.variant_name}' is already in use`,
          );
        }
      }

      Object.assign(variant, updateVariantDto);
      await manager.save(variant);

      return variant;
    });
  }

  async updateVariantMainImage(
    variantId: string,
    mainImage: Express.Multer.File,
  ) {
    if (!mainImage) {
      throw new BadRequestException('Main image is required');
    }

    await this.supabaseService.uploadProductVariantMainImage(
      mainImage,
      variantId,
    );
  }

  async updateVariantGalleryImages(
    variantId: string,
    listKeepUrlImagesRequestDto: ListKeepUrlImagesRequestDto, // URL
    newImages: Express.Multer.File[],
  ) {
    const keepImages = listKeepUrlImagesRequestDto.keep_images;

    if (!newImages || newImages.length === 0) {
      throw new BadRequestException('Gallery images are required');
    }

    const listDeleteImage = this.dataSource.transaction(async (manager) => {
      const existingImages = await manager.find(
        this.productImageRepository.target,
        {
          where: { productVariant: { id: variantId }, is_main: false },
        },
      );

      const imagesToDelete = existingImages.filter(
        (img) => !keepImages.includes(img.product_url),
      );

      if (imagesToDelete.length > 0) {
        const urlsToDelete = imagesToDelete.map((img) => img.product_url);
        await this.supabaseService.deleteProductVariantImages(urlsToDelete);

        for (const img of imagesToDelete) {
          await manager.delete(this.productImageRepository.target, {
            id: img.id,
          });
        }
      }

      return imagesToDelete.map((img) => img.product_url);
    });

    const uploadedUrls =
      await this.supabaseService.uploadProductVariantGallaryImage(
        newImages,
        variantId,
      );

    const newImageEntities = uploadedUrls.map((url) =>
      this.productImageRepository.create({
        is_main: false,
        product_url: url,
        productVariant: { id: variantId } as ProductVariant,
      }),
    );
    await this.productImageRepository.save(newImageEntities);

    const deletedUrls = await listDeleteImage;

    return {
      deleted_images: deletedUrls,
      new_images: uploadedUrls,
    };
  }

  // DELETE IN DB FIRST THEN DELETE IN SUPABASE
  async deleteImages(listImagesIdRequestDto: ListImagesIdRequestDto) {
    return await this.dataSource.transaction(async (manager) => {
      const images = await manager.find(this.productImageRepository.target, {
        where: listImagesIdRequestDto.images_url.map((url) => ({
          product_url: url,
        })),
      });

      if (!images.length) {
        throw new NotFoundException('No images found with given URLs');
      }

      // Check main image
      const hasMainImage = images.some((img) => img.is_main === true);
      if (hasMainImage) {
        throw new BadRequestException(
          'Variant need at least one main image! Please try again',
        );
      }

      await manager.delete(this.productImageRepository.target, {
        id: In(images.map((img) => img.id)),
      });

      try {
        await this.supabaseService.deleteProductVariantImages(
          listImagesIdRequestDto.images_url,
        );
      } catch (error) {
        console.error('Supabase delete error:', error);
      }

      return { message: 'Images deleted successfully' };
    });
  }

  async deleteVariant(id: string) {
    let listVariantImages: string[] = [];

    try {
      await this.dataSource.transaction(async (manager) => {
        const images = await manager.find(this.productImageRepository.target, {
          where: { productVariant: { id } },
        });
        listVariantImages = images.map((img) => img.product_url);

        const variant = await manager.findOne(
          this.productVariantRepository.target,
          { where: { id } },
        );
        if (!variant) {
          throw new NotFoundException(`Variant with id ${id} not found`);
        }

        await manager.delete(this.productVariantRepository.target, { id });
      });

      if (listVariantImages.length > 0) {
        try {
          await this.supabaseService.deleteProductVariantImages(
            listVariantImages,
          );
        } catch (supabaseError) {
          console.warn('Supabase cleanup failed:', supabaseError.message);
        }
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        `Failed to delete variant ${id}: ${error.message}`,
      );
    }
  }
}
