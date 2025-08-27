import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDigitalKeyRequestDto {
  @IsString()
  @IsNotEmpty()
  key_code: string;

  @IsNotEmpty()
  @IsUUID()
  product_variant_id: string;
}

export class UpdateDigitalKeyRequestDto {
  @IsString()
  @IsNotEmpty()
  key_code: string;

  @IsNotEmpty()
  @IsUUID()
  product_variant_id: string;
}
