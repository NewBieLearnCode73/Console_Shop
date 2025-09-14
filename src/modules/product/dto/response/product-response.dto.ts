import { ProductStatus } from 'src/constants/product_status.enum';
import { ProductType } from 'src/constants/product_type.enum';

export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
  product_type: ProductType;
  weight: number; // in grams
  status: ProductStatus;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  category_id: string;
  brand_id: string;
  image: string;
}

export class SearchProductResponseDto {
  id: string;
  variant_name: string;
  slug: string;
  sku: string;
  price: number;
  discount: number;
  color: string;
  other_attributes: Record<string, any>;
  images: object[];
}
