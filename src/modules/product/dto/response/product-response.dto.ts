import { ProductStatus } from 'src/constants/product_status.enum';
import { ProductType } from 'src/constants/product_type.enum';

export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
  product_type: ProductType;
  status: ProductStatus;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  category_id: string;
  brand_id: string;
}
