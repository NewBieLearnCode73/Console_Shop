import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UploadedFiles,
  UseInterceptors,
  ParseUUIDPipe,
  BadRequestException,
  Patch,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProductVariantService } from '../service/product_variant.service';
import {
  CreateProductVariantDto,
  ListKeepUrlImagesRequestDto,
  SearchProductVariantByCategoryAndBrandRequestDto,
} from '../dto/request/product_variant-request.dto';
import {
  CreatePhysicalVariantDto,
  UpdateVariantDto,
} from '../dto/request/product_variant-request.dto';
import { ListImagesIdRequestDto } from '../dto/request/product_image-request.dto';

@Controller('api/product-variants')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  // Get similar variants by variant id
  @Get(':id/similar')
  async getSimilarVariants(
    @Param('id', ParseUUIDPipe) variantId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 8;
    return await this.productVariantService.getSimilarVariants(
      variantId,
      limitNumber,
    );
  }

  // Get variant by id
  @Get(':id')
  async getVariant(@Param('id', ParseUUIDPipe) variantId: string) {
    return await this.productVariantService.getVariantById(variantId);
  }

  // Get all variants by product id
  @Get('product/:productId')
  async getVariantsByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return await this.productVariantService.getAllVariantsByProductId(
      productId,
    );
  }

  // Create physical variant
  @Post('physical')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'main_image', maxCount: 1 },
        { name: 'gallery_images', maxCount: 3 },
      ],
      {
        limits: {
          fileSize: 3 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
          const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/svg+xml',
          ];

          if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new BadRequestException(
                'Invalid file type. Only JPEG, PNG, WEBP, SVG allowed!',
              ),
              false,
            );
          }
        },
      },
    ),
  )
  async createPhysicalVariant(
    @Body()
    createVariantDto: CreatePhysicalVariantDto,
    @UploadedFiles()
    files: {
      main_image: Express.Multer.File[];
      gallery_images: Express.Multer.File[];
    },
  ) {
    return await this.productVariantService.createPhysicalVariant(
      createVariantDto,
      files.main_image?.[0],
      files.gallery_images,
    );
  }

  // Create digital variant with digital keys CSV upload
  @Post('digital')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'main_image', maxCount: 1 },
        { name: 'gallery_images', maxCount: 3 },
        { name: 'digital_keys_csv', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
          const imageMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/svg+xml',
          ];

          if (imageMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
          }

          if (file.mimetype === 'text/csv') {
            return cb(null, true);
          }

          return cb(
            new BadRequestException(
              'Invalid file type. Only JPEG, PNG, WEBP, SVG, or CSV allowed!',
            ),
            false,
          );
        },
      },
    ),
  )
  async createDigitalVariant(
    @Body() createDigitalVariant: CreateProductVariantDto,
    @UploadedFiles()
    files: {
      main_image: Express.Multer.File[];
      gallery_images: Express.Multer.File[];
      digital_keys_csv: Express.Multer.File[];
    },
  ) {
    return await this.productVariantService.createDigitalVariant(
      createDigitalVariant,
      files.main_image[0],
      files.gallery_images,
      files.digital_keys_csv[0],
    );
  }

  // Update variant properties
  @Put(':id')
  async updateVariant(
    @Param('id', ParseUUIDPipe) variantId: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return await this.productVariantService.updateVariant(
      variantId,
      updateVariantDto,
    );
  }

  // Update variant main image
  @Put(':id/main-image')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'main_image', maxCount: 1 }], {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const imageMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/svg+xml',
        ];

        if (imageMimeTypes.includes(file.mimetype)) {
          return cb(null, true);
        }

        return cb(
          new BadRequestException(
            'Invalid file type. Only JPEG, PNG, WEBP, SVG allowed!',
          ),
          false,
        );
      },
    }),
  )
  async updateVariantMainImage(
    @Param('id', ParseUUIDPipe) variantId: string,
    @UploadedFiles() files: { main_image: Express.Multer.File[] },
  ) {
    return await this.productVariantService.updateVariantMainImage(
      variantId,
      files.main_image[0],
    );
  }

  // Update variant gallery image
  @Put(':id/gallery-images')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'gallery_images', maxCount: 3 }], {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const imageMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/svg+xml',
        ];

        if (imageMimeTypes.includes(file.mimetype)) {
          return cb(null, true);
        }

        return cb(
          new BadRequestException(
            'Invalid file type. Only JPEG, PNG, WEBP, SVG allowed!',
          ),
          false,
        );
      },
    }),
  )
  async updateVariantGalleryImages(
    @Param('id', ParseUUIDPipe) variantId: string,
    @Body() listKeepUrlImagesRequestDto: ListKeepUrlImagesRequestDto,
    @UploadedFiles()
    files: {
      gallery_images: Express.Multer.File[];
    },
  ) {
    return await this.productVariantService.updateVariantGalleryImages(
      variantId,
      listKeepUrlImagesRequestDto,
      files.gallery_images,
    );
  }

  // Add more digital keys
  @Patch(':id/digital-keys')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'digital_keys_csv', maxCount: 1 }], {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
          return cb(null, true);
        }

        return cb(
          new BadRequestException('Invalid file type. Only CSV allowed!'),
          false,
        );
      },
    }),
  )
  async addMoreDigitalKeys(
    @Param('id', ParseUUIDPipe) variantId: string,
    @UploadedFiles() files: { digital_keys_csv: Express.Multer.File[] },
  ) {
    return await this.productVariantService.addingDigitalKeys(
      variantId,
      files.digital_keys_csv[0],
    );
  }

  // Delete variant
  @Delete(':id')
  async deleteVariant(@Param('id', ParseUUIDPipe) variantId: string) {
    await this.productVariantService.deleteVariant(variantId);
  }

  // Take all url images:
  // https://dvdlrexmnottnuisgfpn.supabase.co/storage/v1/object/public/product_variant_images/d63af260-3944-415f-af40-806d56df0088/gallery_1756112022856
  // https://dvdlrexmnottnuisgfpn.supabase.co/storage/v1/object/public/product_variant_images/d63af260-3944-415f-af40-806d56df0088/gallery_1756112022856
  // https://dvdlrexmnottnuisgfpn.supabase.co/storage/v1/object/public/product_variant_images/d63af260-3944-415f-af40-806d56df0088/gallery_1756112022856
  @Delete('images')
  async deleteImages(@Body() listImageRequestDto: ListImagesIdRequestDto) {
    await this.productVariantService.deleteImages(listImageRequestDto);
  }
}
