import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseService } from 'src/modules/supabase/service/supabase.service';
import { ProfileService } from '../service/profile.service';
import { Role } from 'src/constants/role.enum';
import { UserService } from '../service/user.service';
import { RolesDecorator } from 'src/decorators/role_decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';
import type { Request as ExpressRequest } from 'express';
import {
  ChangeUserRoleRequestDto,
  ProvideNewPasswordRequestDto,
} from '../dto/request/user-request.dto';

@Controller('api/users')
export class UserController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly profileService: ProfileService,
    private readonly userService: UserService,
  ) {}

  // *****************************************************************//
  // ***************************** ADMIN *****************************//
  // *****************************************************************//

  // GET ALL USER WITH PROFILE
  @Get('admin')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async getAllUserWithProfile(
    @Query() paginationRequestDto: PaginationRequestDto,
  ) {
    return this.userService.findAllUserWithProfile(paginationRequestDto);
  }

  // GET USER BY ID WITH PROFILE
  @Get('admin/:id')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async getUserWithProfile(@Param('id') id: string) {
    return this.userService.findUserWithProfile(id);
  }

  // ACTIVE USER BY ID
  @Patch('admin/active/:id')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async activeUserById(@Param('id') id: string, @Req() req: ExpressRequest) {
    return this.userService.activeUserById(id);
  }

  // INACTIVE USER BY ID
  @Patch('admin/inactive/:id')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async inactiveUserById(@Param('id') id: string, @Req() req: ExpressRequest) {
    const access_token = req.cookies['access_token'];

    return this.userService.inactiveUserById(access_token, id);
  }

  // CHANGE ROLE USER BY ID
  @Patch('admin/change-role/:id')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async changeUserRoleById(
    @Param('id') id: string,
    @Body() role: ChangeUserRoleRequestDto,
    @Req() req: ExpressRequest,
  ) {
    const access_token = req.cookies['access_token'];

    return this.userService.changeUserRoleById(access_token, id, role.role);
  }

  // Provide new password to user
  @Patch('admin/gennerate-user-password')
  @RolesDecorator([Role.ADMIN])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async resetUserPasswordById(@Body() id: ProvideNewPasswordRequestDto) {
    return this.userService.sendPasswordToUserEmail(id.userId);
  }

  // *****************************************************************//
  // ***************************** MANAGER ***************************//
  // *****************************************************************//

  //  GET ALL USER WITH PROFILE
  @Get('manager')
  @RolesDecorator([Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async getAllUserIsCustomerWithProfile(
    @Query() paginationRequestDto: PaginationRequestDto,
  ) {
    return this.userService.findAllUserIsCustomerWithProfile(
      paginationRequestDto,
    );
  }

  // GET USER BY ID WITH PROFILE
  @Get('manager/:id')
  @RolesDecorator([Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async getUserIsCustomerById(@Param('id') id: string) {
    return this.userService.findUserIsCustomerWithProfile(id);
  }

  // ACTIVE USER HAS ROLE CUSTOMER
  @Patch('manager/active/:id')
  @RolesDecorator([Role.MANAGER])
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  async activeUserIsCustomerById(@Param('id') id: string) {
    return this.userService.activeUserIsCustomerById(id);
  }
}
