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
// import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
// import { RolesDecorator } from 'src/decorators/role_decorator';
// import { Role } from 'src/constants/role.enum';
// import { RolesGuard } from 'src/guards/role.guard';

@Controller('api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(@Query() paginationRequestDto: PaginationRequestDto) {
    return this.categoryService.findAllCategories(paginationRequestDto);
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findByCategoryById(id);
  }

  @Get('/slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return await this.categoryService.findByCategorySlug(slug);
  }

  @Post()
  // @RolesDecorator(Role.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createCategoryDto: CreateCategoryRequestDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Put(':id')
  // @RolesDecorator(Role.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryRequestDto,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  // @RolesDecorator(Role.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
