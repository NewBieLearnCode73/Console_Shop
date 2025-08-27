import { IsNotEmpty, IsUrl } from 'class-validator';

export class ListImagesIdRequestDto {
  @IsNotEmpty({ each: true })
  @IsUrl({}, { each: true })
  images_url: string[];
}
