import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { SupabaseService } from 'src/modules/supabase/service/supabase.service';
import { ProfileService } from '../service/profile.service';
import { Role } from 'src/constants/role.enum';
import { UserService } from '../service/user.service';
import { RolesDecorator } from 'src/decorators/role_decorator';
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { RolesGuard } from 'src/guards/role.guard';

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
  @RolesDecorator(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllUserWithProfile() {
    return this.userService.findAllUserWithProfile();
  }

  // GET USER BY ID WITH PROFILE
  @Get('admin/:id')
  @RolesDecorator(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserWithProfile(@Param('id') id: string) {
    return this.userService.findUserWithProfile(id);
  }

  // ACTIVE USER BY ID
  @Patch('admin/active/:id')
  @RolesDecorator(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async activeUserById(@Param('id') id: string) {
    return this.userService.activeUserById(id);
  }

  // CHANGE ROLE USER BY ID
  @Patch('admin/change-role/:id')
  @RolesDecorator(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async changeUserRoleById(@Param('id') id: string, @Body('role') role: Role) {
    return this.userService.changeUserRoleById(id, role);
  }

  // *****************************************************************//
  // ***************************** MANAGER ***************************//
  // *****************************************************************//

  //  GET ALL USER WITH PROFILE
  @Get('manager')
  @RolesDecorator(Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllUserIsCustomerWithProfile() {
    return this.userService.findAllUserIsCustomerWithProfile();
  }

  // GET USER BY ID WITH PROFILE
  @Get('manager/:id')
  @RolesDecorator(Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserIsCustomerById(@Param('id') id: string) {
    return this.userService.findUserIsCustomerWithProfile(id);
  }

  // ACTIVE USER HAS ROLE CUSTOMER
  @Patch('manager/active/:id')
  @RolesDecorator(Role.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async activeUserIsCustomerById(@Param('id') id: string) {
    return this.userService.activeUserIsCustomerById(id);
  }
}
