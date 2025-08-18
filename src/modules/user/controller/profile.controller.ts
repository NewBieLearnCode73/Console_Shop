import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from '../service/profile.service';
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesDecorator } from 'src/decorators/role_decorator';
import { Role } from 'src/constants/role.enum';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('api/profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  //Get User Profile by id
  @Get(':id')
  @RolesDecorator(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserProfileById(@Param('id') userId: string) {
    // return u
  }

  // Get profile
  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthenticationRequest) {
    return this.profileService.getProfile(req.user.id);
  }

  // Update profile (Not include image)
  @Post()
  @UseGuards(JwtAuthGuard)
  async createProfile(
    @Body() createProfileDto: CreateProfileDto,
    @Request() req: AuthenticationRequest,
  ) {
    return this.profileService.createProfile(req.user.id, createProfileDto);
  }

  // Upload image
  @Post('update-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async updateImage(
    @Request() req: AuthenticationRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.updateUserAvatar(req.user.id, file);
  }

  // Delete User Avatar
  @Get('del')
  @UseGuards(JwtAuthGuard)
  async deleteUserAvatar(@Request() req: AuthenticationRequest) {
    return this.profileService.deleteUserAvatar(req.user.id);
  }
}
