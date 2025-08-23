import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
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

  @IsString()
  seo_title?: string;

  @IsString()
  seo_description?: string;

  @IsString()
  seo_keywords?: string;

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

  @IsEnum(ProductType)
  product_type?: ProductType;

  @IsString()
  seo_title?: string;

  @IsString()
  seo_description?: string;

  @IsString()
  seo_keywords?: string;

  @IsUUID()
  category_id?: string;

  @IsUUID()
  brand_id?: string;
}
