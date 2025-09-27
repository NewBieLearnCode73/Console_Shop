import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ProductStatus } from 'src/constants/product_status.enum';
import { ProductType } from 'src/constants/product_type.enum';

export class CreateProductRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(ProductType)
  product_type: ProductType;

  @IsNotEmpty()
  @IsNumber()
  weight: number; // in grams

  @IsString()
  seo_title?: string;

  @IsString()
  seo_description?: string;

  @IsNotEmpty()
  @IsUUID()
  category_id: string;

  @IsNotEmpty()
  @IsUUID()
  brand_id: string;
}

export class UpdateProductRequestDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  weight: number; // in grams

  @IsString()
  seo_title?: string;

  @IsString()
  seo_description?: string;

  @IsUUID()
  category_id?: string;

  @IsUUID()
  brand_id?: string;
}

export class UpdateProductStatusRequestDto {
  @IsNotEmpty()
  @IsEnum(ProductStatus)
  status: ProductStatus;
}

export class FilterProductRequestDto {
  @IsString()
  @IsOptional()
  categorySlug?: string;

  @IsString()
  @IsOptional()
  brandSlug?: string;

  @IsEnum(ProductType)
  @IsOptional()
  productType?: ProductType;
}
