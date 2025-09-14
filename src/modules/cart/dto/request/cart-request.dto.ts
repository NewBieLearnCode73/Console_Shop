import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class AddItemToCartRequestDto {
  @IsNotEmpty()
  @IsUUID()
  productVariantId: string;

  @Transform(({ value }) => parseInt(value))
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}

export class RemoveItemFromCartRequestDto {
  @IsNotEmpty()
  @IsUUID()
  productVariantId: string;
}

export class RemoveMultipleItemsFromCartRequestDto {
  @IsNotEmpty()
  @IsArray()
  @IsUUID('all', { each: true })
  productVariantIds: string[];
}
