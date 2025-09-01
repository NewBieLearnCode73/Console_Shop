import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { OrderType } from 'src/constants/order_type.enum';
import { PaymentMethod } from 'src/constants/payment_method.enum';

export class OrderBuyNowRequestDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  productVariantId: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsUUID()
  addressId: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class OrderCheckOutRequestDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsEnum(OrderType)
  orderType: OrderType;

  @IsNotEmpty()
  @IsUUID()
  addressId: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
