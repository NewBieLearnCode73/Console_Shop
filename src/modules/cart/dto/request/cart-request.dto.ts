import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { CartType } from 'src/constants/cart_type.enum';
import { PaymentMethod } from 'src/constants/payment_method.enum';

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

export class CheckOutAddressRequestDto {
  @IsNotEmpty()
  @IsUUID()
  addressId: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class CartTypeRequestDto {
  @IsNotEmpty()
  @IsEnum(CartType)
  cartType: CartType;
}
