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
  UseGuards,
} from '@nestjs/common';
import { BrandService } from '../service/brand.service';
import {
  CreateBrandRequestDto,
  UpdateBrandRequestDto,
} from '../dto/request/brand-request.dto';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';
import { RolesDecorator } from 'src/decorators/role_decorator';
import { Role } from 'src/constants/role.enum';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('api/brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  //******************  FOR ALL - START  ************************//
  @Get()
  async findAll(@Query() paginationRequestDto: PaginationRequestDto) {
    return this.brandService.findAllBrands(paginationRequestDto);
  }

  @Get(':id')
  async findOneById(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.findBrandById(id);
  }

  @Get('/slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return await this.brandService.findBrandBySlug(slug);
  }

  // ******************  FOR ALL - END  ************************//

  //******************  FOR MANAGER and ADMIN - START  ************************//
  @Post()
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async create(@Body() createBrandRequestDto: CreateBrandRequestDto) {
    return this.brandService.createBrand(createBrandRequestDto);
  }

  @Put(':id')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBrandRequestDto: UpdateBrandRequestDto,
  ) {
    return this.brandService.updateBrand(id, updateBrandRequestDto);
  }

  //******************  FOR MANAGER and ADMIN - END  ************************//

  //******************  FOR ADMIN - START  ************************//

  @Delete(':id')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.deleteBrand(id);
  }
  //******************  FOR ADMIN - END  ************************//
}
