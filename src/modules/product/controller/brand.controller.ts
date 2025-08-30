import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BrandService } from '../service/brand.service';
import {
  CreateBrandRequestDto,
  UpdateBrandRequestDto,
} from '../dto/request/brand-request.dto';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';

@Controller('api/brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  async findAll(@Query() paginationRequestDto: PaginationRequestDto) {
    return this.brandService.findAllBrands(paginationRequestDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.findBrandById(id);
  }

  @Post()
  async create(@Body() createBrandRequestDto: CreateBrandRequestDto) {
    return this.brandService.createBrand(createBrandRequestDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBrandRequestDto: UpdateBrandRequestDto,
  ) {
    return this.brandService.updateBrand(id, updateBrandRequestDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.deleteBrand(id);
  }
}
