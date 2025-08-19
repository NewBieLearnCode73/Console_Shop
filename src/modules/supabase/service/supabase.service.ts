import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  constructor(private readonly supabaseClient: SupabaseClient) {}

  async deleteUserAvatar(userId: string) {
    const { data, error } = await this.supabaseClient.storage
      .from('user_avatar')
      .list(userId);

    if (error) {
      throw new InternalServerErrorException(
        'Some thing was wrong with user image!',
      );
    }

    const pathFile = `${userId}/${data?.[0]?.name}`;

    await this.supabaseClient.storage.from('user_avatar').remove([pathFile]);
  }

  async uploadUserAvatar(file: Express.Multer.File, userId: string) {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new NotAcceptableException(
        'Please upload a valid image file (JPEG, PNG, WEBP, SVG)',
      );
    }

    const newFileName = `${userId}/${Date.now()}`;

    const { data: uploadData, error } = await this.supabaseClient.storage
      .from('user_avatar')
      .upload(newFileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
      });

    if (error) {
      throw new NotAcceptableException(
        `Failed to upload avatar: ${error.message}`,
      );
    }

    const { data: publicUrlData } = this.supabaseClient.storage
      .from('user_avatar')
      .getPublicUrl(uploadData.path);

    return publicUrlData.publicUrl;
  }
}
