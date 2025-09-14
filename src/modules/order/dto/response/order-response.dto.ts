export class OrderShippingResponseDto {
  orderId: string;
  to_name: string;
  to_phone: string;
  to_address: string;
  to_ward_code: string;
  to_district_id: number;
  cod_amount: number;
  items: OrderItemResponseDto[];
}

export class OrderItemResponseDto {
  name: string;
  code: string;
  quantity: number;
  weight: number;
}
