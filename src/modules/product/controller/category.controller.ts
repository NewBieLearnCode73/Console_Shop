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
import { CategoryService } from '../service/category.service';
import {
  CreateCategoryRequestDto,
  UpdateCategoryRequestDto,
} from '../dto/request/category-request.dto';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';
import { RolesDecorator } from 'src/decorators/role_decorator';
import { Role } from 'src/constants/role.enum';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  //******************  FOR ALL - START  ************************//
  @Get()
  async findAll(@Query() paginationRequestDto: PaginationRequestDto) {
    return this.categoryService.findAllCategories(paginationRequestDto);
  }

  @Get(':id')
  async findOneById(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findByCategoryById(id);
  }

  @Get('/slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return await this.categoryService.findByCategorySlug(slug);
  }

  //******************  FOR ALL - END  ************************//

  //******************  FOR MANAGER and ADMIN - START  ************************//

  @Post()
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async create(@Body() createCategoryDto: CreateCategoryRequestDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Put(':id')
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryRequestDto,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  //******************  FOR MANAGER and ADMIN - END  ************************//

  //******************  FOR ADMIN - START  ************************//

  @Delete(':id')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.deleteCategory(id);
  }
  //******************  FOR ADMIN - END  ************************//
}
