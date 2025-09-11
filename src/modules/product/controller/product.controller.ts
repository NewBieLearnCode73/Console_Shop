import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from '../service/product.service';
import {
  CreateProductRequestDto,
  FilterProductRequestDto,
  UpdateProductRequestDto,
  UpdateProductStatusRequestDto,
} from '../dto/request/product-request.dto';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';
import { RolesDecorator } from 'src/decorators/role_decorator';
import { Role } from 'src/constants/role.enum';
import { ProductStatus } from 'src/constants/product_status.enum';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  //******************  FOR ALL - START  ************************//
  @Get('/for-users-and-guests')
  async findAllProductsForUsersAndGuests(
    @Query() paginationRequestDto: PaginationRequestDto,
  ) {
    return this.productService.findAllProductsForUsersAndGuests(
      paginationRequestDto,
    );
  }

  @Get('/for-users-and-guests/variants/slug/:slug')
  async findProductVariantsForUsersAndGuests(@Param('slug') slug: string) {
    return this.productService.findProductVariantsForUsersAndGuests(slug);
  }

  @Get('/for-users-and-guests/filter')
  async filterProductsForUsersAndGuests(
    @Query() filterProductRequestDto: FilterProductRequestDto,
    @Query() paginationRequestDto: PaginationRequestDto,
  ) {
    return this.productService.filterProductsForUsersAndGuests(
      filterProductRequestDto,
      paginationRequestDto,
    );
  }

  // ******************* FOR ALL - END  *************************//

  // ******************* FOR MANAGER and ADMIN - START ***********************/
  @Get()
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async findAll(
    @Query() paginationRequestDto: PaginationRequestDto,
    @Query('status', new ParseEnumPipe(ProductStatus, { optional: true }))
    status?: ProductStatus,
  ) {
    return this.productService.findAll(paginationRequestDto, status);
  }

  @Get('/slug/:slug')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async findProductBySlug(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  @Get(':id')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async findProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findOne(id);
  }

  @Post()
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async createProduct(@Body() createProductDto: CreateProductRequestDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Put(':id')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductRequestDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  // ******************* FOR MANAGER and ADMIN - END ***********************/

  // ******************* FOR ADMIN - START ***********************/
  @Patch('/status/:id')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async updateProductStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductStatusDto: UpdateProductStatusRequestDto,
  ) {
    return this.productService.updateProductStatus(id, updateProductStatusDto);
  }

  @Delete(':id')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.deleteProduct(id);
  }

  // ******************* FOR ADMIN - END ***********************/
}
