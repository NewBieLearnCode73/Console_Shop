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
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProductVariantService } from '../service/product_variant.service';
import {
  CreateProductVariantDto,
  ListKeepUrlImagesRequestDto,
  SearchProductVariantRequestDto,
} from '../dto/request/product_variant-request.dto';
import {
  CreatePhysicalVariantDto,
  UpdateVariantDto,
} from '../dto/request/product_variant-request.dto';
import { ListImagesIdRequestDto } from '../dto/request/product_image-request.dto';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';
import { RolesDecorator } from 'src/decorators/role_decorator';
import { Role } from 'src/constants/role.enum';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('api/product-variants')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  //*************************************** FOR ALL - START ****************************************/

  // Search by name of variant or product (OUT_OF_STOCK and ACTIVE products only)
  @Get('/for-users-and-guests/search')
  async searchVariants(@Query() searchDto: SearchProductVariantRequestDto) {
    return await this.productVariantService.search(searchDto);
  }

  // Get variant by slug (OUT_OF_STOCK and ACTIVE products only)
  @Get('/for-users-and-guests/slug/:slug')
  async getVariantBySlug(@Param('slug') slug: string) {
    return await this.productVariantService.getVariantBySlug(slug);
  }

  // Get all variants by product id
  @Get('/for-users-and-guests/product/:productId')
  async getVariantsByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return await this.productVariantService.getAllVariantsByProductId(
      productId,
    );
  }

  // Get similar variants by variant id
  @Get('/for-users-and-guests/similar/:id')
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

  //*************************************** FOR ALL - END ******************************************/

  // *************************************** FOR ADMIN and MANAGER - START ****************************************/

  // Get all variants by product id with cost price
  @Get('/productId-with-cost-price/:productId')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async getAllVariantsByProductIdWithCostPrice(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return await this.productVariantService.getAllVariantsByProductIdWithCostPrice(
      productId,
    );
  }

  // Get variant by slug with cost price
  @Get('/slug-with-cost-price/:slug')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async getVariantBySlugWithCostPrice(@Param('slug') slug: string) {
    return await this.productVariantService.getVariantBySlugWithCostPrice(slug);
  }

  // Get variant by id
  @Get('/variantId-with-cost-price/:id')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async getVariant(@Param('id', ParseUUIDPipe) variantId: string) {
    return await this.productVariantService.getVariantByIdWithCostPrice(
      variantId,
    );
  }

  // Create physical variant
  @Post('physical')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
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
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
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

          if (
            file.mimetype === 'text/csv' ||
            file.mimetype === 'application/vnd.ms-excel'
          ) {
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
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async updateVariantProperties(
    @Param('id', ParseUUIDPipe) variantId: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return await this.productVariantService.updateVariantProperties(
      variantId,
      updateVariantDto,
    );
  }

  // Update variant main image
  @Put(':id/main-image')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
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
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
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
    const result = await this.productVariantService.updateVariantGalleryImages(
      variantId,
      listKeepUrlImagesRequestDto,
      files.gallery_images,
    );

    return result;
  }

  // Update variant stock (only for physical product)
  @Patch(':id/physical/stock')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async updatePhysicalStock(
    @Param('id', ParseUUIDPipe) variantId: string,
    @Body('quantity') quantity: number,
  ) {
    return await this.productVariantService.updatePhysicalStock(
      variantId,
      quantity,
    );
  }

  // Add more digital keys (CSV upload)
  @Patch(':id/digital-keys')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'digital_keys_csv', maxCount: 1 }], {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'text/csv' ||
          file.mimetype === 'application/vnd.ms-excel'
        ) {
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

  // Take all url images:
  // https://dvdlrexmnottnuisgfpn.supabase.co/storage/v1/object/public/product_variant_images/d63af260-3944-415f-af40-806d56df0088/gallery_1756112022856
  // https://dvdlrexmnottnuisgfpn.supabase.co/storage/v1/object/public/product_variant_images/d63af260-3944-415f-af40-806d56df0088/gallery_1756112022856
  // https://dvdlrexmnottnuisgfpn.supabase.co/storage/v1/object/public/product_variant_images/d63af260-3944-415f-af40-806d56df0088/gallery_1756112022856
  @Delete('images')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async deleteImages(@Body() listImageRequestDto: ListImagesIdRequestDto) {
    await this.productVariantService.deleteImages(listImageRequestDto);
  }

  // *************************************** FOR ADMIN and MANAGER - END ******************************************/

  //*************************************** FOR ADMIN - START ***********************************************/

  @Get('getAllDigitalKeys/:variantId')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async getAllDigitalKeys(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Query() paginationRequestDto: PaginationRequestDto,
  ) {
    return await this.productVariantService.getAllDigitalKeys(
      variantId,
      paginationRequestDto,
    );
  }

  @Put('digital-key/:variantId')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async addDigitalKeyByTyping(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body('keyCode') keyCode: string,
  ) {
    const newKey = await this.productVariantService.addDigitalKeyByTypeing(
      variantId,
      keyCode,
    );
    return newKey;
  }

  // Delete variant
  @Delete(':id')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async deleteVariant(@Param('id', ParseUUIDPipe) variantId: string) {
    await this.productVariantService.deleteVariant(variantId);
  }

  // Delete key by id
  @Delete('digital-key/:id')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async deleteDigitalKeyById(@Param('id', ParseUUIDPipe) id: string) {
    await this.productVariantService.deleteDigitalKeyById(id);
  }

  //*************************************** FOR ADMIN - END *************************************************/
}
