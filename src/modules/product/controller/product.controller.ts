import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductService } from '../service/product.service';
import {
  CreateProductRequestDto,
  SearchProductRequestDto,
  UpdateProductRequestDto,
  UpdateProductStatusRequestDto,
} from '../dto/request/product-request.dto';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';

@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAllProducts(@Query() paginationRequestDto: PaginationRequestDto) {
    return this.productService.findAll(paginationRequestDto);
  }

  @Get('search')
  async searchProductToGetVariants(
    @Query() searchProductRequestDto: SearchProductRequestDto,
    @Query() paginationRequestDto: PaginationRequestDto,
  ) {
    return this.productService.searchProductToGetVariants(
      searchProductRequestDto,
      paginationRequestDto,
    );
  }

  @Get(':id')
  async findProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findOne(id);
  }

  @Get('/slug/:slug')
  async findProductBySlug(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  @Post()
  async createProduct(@Body() createProductDto: CreateProductRequestDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Put(':id')
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductRequestDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Patch(':id')
  async updateProductStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductStatusDto: UpdateProductStatusRequestDto,
  ) {
    return this.productService.updateProductStatus(id, updateProductStatusDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.deleteProduct(id);
  }
}
