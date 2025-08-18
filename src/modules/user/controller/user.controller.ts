import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { SupabaseService } from 'src/modules/supabase/service/supabase.service';
import { ProfileService } from '../service/profile.service';
import { Role } from 'src/constants/role.enum';
import { UserService } from '../service/user.service';

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

  @Get('admin')
  // @RolesDecorator(Role.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllUserWithProfile() {
    return this.userService.findAllUserWithProfile();
  }

  @Get('admin/:id')
  // @RolesDecorator(Role.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserWithProfile(@Param('id') id: string) {
    return this.userService.findUserWithProfile(id);
  }

  @Patch('admin/active/:id')
  // @RolesDecorator(Role.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async activeUserById(@Param('id') id: string) {
    return this.userService.activeUserById(id);
  }

  @Patch('admin/change-role/:id')
  // @RolesDecorator(Role.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async changeUserRoleById(@Param('id') id: string, @Body('role') role: Role) {
    return this.userService.changeUserRoleById(id, role);
  }
}
