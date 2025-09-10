import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  constructor(
    private readonly supabaseClient: SupabaseClient,
    private readonly configService: ConfigService,
  ) { }

  private get BASE_URL(): string {
    return this.configService.getOrThrow('SUPABASE_BASE_STORAGE_URL');
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

    const newFileName = `${userId}/${userId}_main`;

    const { data: uploadData, error } = await this.supabaseClient.storage
      .from('user_avatar')
      .upload(newFileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true,
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

  async uploadProductVariantMainImage(
    file: Express.Multer.File,
    productVariantId: string,
  ) {
    console.log('mimetype:', file.mimetype);

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

    const newFileName = `${productVariantId}/main_image`;

    const { data: uploadData, error } = await this.supabaseClient.storage
      .from('product_variant_images')
      .upload(newFileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw new NotAcceptableException(
        `Failed to upload product variant images: ${error.message}`,
      );
    }

    const { data: publicUrlData } = this.supabaseClient.storage
      .from('product_variant_images')
      .getPublicUrl(uploadData.path);

    console.log('Public URL:', publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
  }

  async uploadProductVariantGallaryImage(
    files: Express.Multer.File[],
    productVariantId: string,
  ) {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ];

    const publicUrls: string[] = [];

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new NotAcceptableException(
          'Please upload valid image files (JPEG, PNG, WEBP, SVG)',
        );
      }

      const newFileName = `${productVariantId}/gallery_${Date.now()}`;

      const { data: uploadData, error } = await this.supabaseClient.storage
        .from('product_variant_images')
        .upload(newFileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw new NotAcceptableException(
          `Failed to upload product variant images: ${error.message}`,
        );
      }

      const { data: publicUrlData } = this.supabaseClient.storage
        .from('product_variant_images')
        .getPublicUrl(uploadData.path);

      publicUrls.push(publicUrlData.publicUrl);
    }

    return publicUrls;
  }

  // Delete product variant images base on full URL
  // https://dvdlrexmnottnuisgfpn.supabase.co/storage/v1/object/public/product_variant_images/d63af260-3944-415f-af40-806d56df0088/gallery_1756112022856
  async deleteProductVariantImages(listImageUrl: string[]) {
    const baseProductVariantUrl: string =
      this.BASE_URL + 'product_variant_images/';
    const sliceIndex: number = baseProductVariantUrl.length;
    listImageUrl = listImageUrl.map((file) => file.slice(sliceIndex)); // Remove base URL: https://dvdlrexmnottnuisgfpn.supabase.co/storage/v1/object/public/product_variant_images/

    console.log('List image to delete:', listImageUrl);

    const { data, error } = await this.supabaseClient.storage
      .from('product_variant_images')
      .remove(listImageUrl);

    if (error) {
      throw new NotAcceptableException(
        `Failed to delete product variant images: ${error.message}`,
      );
    }
  }
}
