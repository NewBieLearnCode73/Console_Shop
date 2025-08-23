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
  created_at: Date;
  updated_at: Date;

  // Relations
  product: {
    id: string;
    name: string;
    product_type: string;
  };

  images: {
    id: string;
    url: string;
    is_main: boolean;
  }[];

  stock?: {
    id: string;
    quantity: number;
    reserved: number;
  };

  digitalKeys?: {
    id: string;
    key_code: string;
    status: string;
    active_at?: Date;
  }[];
}

export class CreateVariantResponseDto {
  success: boolean;
  message: string;
  data: ProductVariantResponseDto;
}

export class UpdateVariantResponseDto {
  success: boolean;
  message: string;
  data: ProductVariantResponseDto;
}

export class DeleteVariantResponseDto {
  success: boolean;
  message: string;
}
