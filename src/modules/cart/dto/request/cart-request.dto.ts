import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID, Min } from 'class-validator';

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

  @Transform(({ value }) => parseInt(value))
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}
