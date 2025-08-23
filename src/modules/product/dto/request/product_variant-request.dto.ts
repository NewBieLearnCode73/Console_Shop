import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsObject,
  IsArray,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsUUID()
  product_id: string;

  @IsString()
  sku: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  seo_title?: string;

  @IsOptional()
  @IsString()
  seo_description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsObject()
  other_attributes?: Record<string, any>;

  @IsOptional()
  main_image?: Express.Multer.File;

  @IsOptional()
  @IsArray()
  galary_image?: Express.Multer.File[];
}

// DTO for Physical variants (DEVICE, CARD_PHYSICAL)
export class CreatePhysicalVariantDto extends CreateProductVariantDto {
  @IsNumber()
  @Min(0)
  quantity: number;
}

// DTO for Digital variants (CARD_DIGITAL_KEY)
export class CreateDigitalVariantDto extends CreateProductVariantDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  digital_keys?: string[];
}

// Add more digital keys
export class AddMoreDigitalKeysRequestDto {
  @IsArray()
  @IsString({ each: true })
  digital_keys: string[];
}

export class UpdateProductVariantDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  seo_title?: string;

  @IsOptional()
  @IsString()
  seo_description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsObject()
  other_attributes?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;
}
