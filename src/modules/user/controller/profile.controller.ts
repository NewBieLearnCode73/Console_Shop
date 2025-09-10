import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from '../service/profile.service';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  CreateProfileRequestDto,
  UpdateProfileRequestDto,
} from '../dto/request/profile-request.dto';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';

@Controller('api/profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  // GET PROFILE
  @Get()
  @UseGuards(JwtCookieAuthGuard)
  async getProfile(@Request() req: AuthenticationRequest) {
    return this.profileService.getProfile(req.user.id);
  }

  // CREATE PROFILE (Not include image)
  @Post()
  @UseGuards(JwtCookieAuthGuard)
  async createProfile(
    @Body() createProfileDto: CreateProfileRequestDto,
    @Request() req: AuthenticationRequest,
  ) {
    return this.profileService.createProfile(req.user.id, createProfileDto);
  }

  // UPLOAD IMAGE
  @Post('update-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtCookieAuthGuard)
  async updateImage(
    @Request() req: AuthenticationRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.updateUserAvatar(req.user.id, file);
  }

  // Update profile (Not include image)
  @Patch()
  @UseGuards(JwtCookieAuthGuard)
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileRequestDto,
    @Request() req: AuthenticationRequest,
  ) {
    return this.profileService.updateProfile(req.user.id, updateProfileDto);
  }
}
