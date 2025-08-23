export class CreateCategoryResponseDto {
  id: string;
  name: string;
  description: string;
  seo_title?: string;
  seo_description?: string;
  parent_id?: string;
  created_at: Date;
  updated_at: Date;
}

export class UpdateCategoryResponseDto {
  id: string;
  name: string;
  description: string;
  seo_title?: string;
  seo_description?: string;
  parent_id?: string;
}

export class CategoryResponseDto {
  id: string;
  name: string;
  description: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: Date;
  updated_at: Date;
  children: CategoryResponseDto[];
}
