import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from '../service/product.service';
import {
  CreateProductRequestDto,
  UpdateProductRequestDto,
  UpdateProductStatusRequestDto,
} from '../dto/request/product-request.dto';

@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAllProducts() {
    return this.productService.findAll();
  }

  @Get(':id')
  async findProductById(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Post()
  async createProduct(@Body() createProductDto: CreateProductRequestDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductRequestDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Patch(':id')
  async updateProductStatus(
    @Param('id') id: string,
    @Body() updateProductStatusDto: UpdateProductStatusRequestDto,
  ) {
    return this.productService.updateProductStatus(id, updateProductStatusDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
