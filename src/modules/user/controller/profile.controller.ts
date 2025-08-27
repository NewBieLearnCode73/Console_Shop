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
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  CreateProfileRequestDto,
  UpdateProfileRequestDto,
} from '../dto/request/profile-request.dto';

@Controller('api/profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET PROFILE BY JWT
  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthenticationRequest) {
    return this.profileService.getProfile(req.user.id);
  }

  // CREATE PROFILE BY JWT (Not include image)
  @Post()
  @UseGuards(JwtAuthGuard)
  async createProfile(
    @Body() createProfileDto: CreateProfileRequestDto,
    @Request() req: AuthenticationRequest,
  ) {
    return this.profileService.createProfile(req.user.id, createProfileDto);
  }

  // UPLOAD IMAGE
  @Post('update-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async updateImage(
    @Request() req: AuthenticationRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.updateUserAvatar(req.user.id, file);
  }

  // Update profile (Not include image)
  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileRequestDto,
    @Request() req: AuthenticationRequest,
  ) {
    return this.profileService.updateProfile(req.user.id, updateProfileDto);
  }
}
