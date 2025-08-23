import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDigitalKeyRequestDto {
  @IsString()
  @IsNotEmpty()
  key_code: string;

  @IsNotEmpty()
  product_variant_id: string;
}

export class UpdateDigitalKeyRequestDto {
  @IsString()
  @IsNotEmpty()
  key_code: string;

  @IsNotEmpty()
  product_variant_id: string;
}
