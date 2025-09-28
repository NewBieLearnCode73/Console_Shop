import { IsEnum, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { OrderStatus } from 'src/constants/order_status.enum';
import { OrderType } from 'src/constants/order_type.enum';
import { PaymentMethod } from 'src/constants/payment_method.enum';

export class OrderDigitalBuyNowRequestDto {
  @IsNotEmpty()
  @IsUUID()
  productVariantId: string;

  @IsNotEmpty()
  @Min(1)
  quantity: number;
}

export class OrderPhysicalBuyNowRequestDto {
  @IsNotEmpty()
  @IsUUID()
  productVariantId: string;

  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsUUID()
  addressId: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class OrderCheckoutCartRequestDto {
  @IsNotEmpty()
  @IsUUID()
  productVariantId: string;

  @IsNotEmpty()
  @Min(1)
  quantity: number;
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

export class ChangeOrderAddressRequestDto {
  @IsNotEmpty()
  @IsUUID()
  addressId: string;
}

export class OrderIdRequestDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;
}

export class OrderDigitalKeyRequestDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsUUID()
  product_variant_id: string;
}

export class OrderStatusRequestDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class FindAllOrdersByCustomerIdRequestDto {
  @IsNotEmpty()
  @IsUUID()
  customerId: string;
}
