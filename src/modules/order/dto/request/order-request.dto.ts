import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { OrderType } from 'src/constants/order_type.enum';
import { PaymentMethod } from 'src/constants/payment_method.enum';

export class OrderDigitalBuyNowRequestDto {
  @IsNotEmpty()
  @IsUUID()
  productVariantId: string;
}

export class OrderCheckOutRequestDto {
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
