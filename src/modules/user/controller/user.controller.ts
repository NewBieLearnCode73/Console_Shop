import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/modules/supabase/service/supabase.service';

@Controller('user')
export class UserController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    const avatarUrl = await this.supabaseService.uploadUserAvatar(file, userId);
    return { avatarUrl };
  }
}
