import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsObject,
  IsArray,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  @IsString()
  variant_name: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  cost_price: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  price: number;

  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  discount?: number;

  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsNotEmpty()
  @IsObject()
  other_attributes: Record<string, any>;
}

// DTO for Physical variants (DEVICE, CARD_PHYSICAL)
export class CreatePhysicalVariantDto extends CreateProductVariantDto {
  @IsOptional()
  @IsString()
  color?: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class UpdateVariantDto {
  @IsNotEmpty()
  @IsString()
  variant_name: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  cost_price: number;

  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  discount: number;

  @IsOptional()
  @IsString()
  color: string;

  @IsNotEmpty()
  @IsObject()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  other_attributes?: Record<string, any>;
}

export class ListKeepUrlImagesRequestDto {
  @IsArray()
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  keep_images: string[];
}

export class SearchProductVariantByCategoryAndBrandRequestDto {
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  brandSlug?: string;
}

export class SearchProductVariantRequestDto {
  @IsNotEmpty()
  @IsString()
  query: string;

  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsOptional()
  @IsNumber()
  @Min(4)
  limitProduct?: number;

  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsOptional()
  @IsNumber()
  @Min(4)
  limitVariant?: number;
}
