export class CreateBrandResponseDto {
  id: string;
  name: string;
  description: string;
  seo_title?: string;
  seo_description?: string;
}

export class UpdateBrandResponseDto {
  id: string;
  name: string;
  description: string;
  seo_title?: string;
  seo_description?: string;
}
