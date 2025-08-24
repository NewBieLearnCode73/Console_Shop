import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BrandService } from '../service/brand.service';
import {
  CreateBrandRequestDto,
  UpdateBrandRequestDto,
} from '../dto/request/brand-request.dto';

@Controller('api/brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  async findAll() {
    return this.brandService.findAllBrands();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.brandService.findBrandById(id);
  }

  @Post()
  async create(@Body() createBrandRequestDto: CreateBrandRequestDto) {
    return this.brandService.createBrand(createBrandRequestDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBrandRequestDto: UpdateBrandRequestDto,
  ) {
    return this.brandService.updateBrand(id, updateBrandRequestDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.brandService.deleteBrand(id);
  }
}
