import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from '../service/profile.service';
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProfileRequestDto } from '../dto/request/profile-request.dto';

@Controller('api/profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET PROFILE BY JWT
  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthenticationRequest) {
    return this.profileService.getProfile(req.user.id);
  }

  // UPDATE PROFILE BY JWT (Not include image)
  @Post()
  @UseGuards(JwtAuthGuard)
  async createProfile(
    @Body() createProfileDto: CreateProfileRequestDto,
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
}
