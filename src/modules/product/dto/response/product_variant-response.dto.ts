export class ProductVariantResponseDto {
  id: string;
  sku: string;
  price: number;
  slug: string;
  seo_title: string;
  seo_description: string;
  discount: number;
  color: string;
  other_attributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
