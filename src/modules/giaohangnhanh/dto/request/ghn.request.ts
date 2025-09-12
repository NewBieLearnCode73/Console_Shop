import { Expose } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class GhnRequestDto {
  @Expose()
  service_id: number;
  @Expose()
  to_district_id: number;
  @Expose()
  to_ward_code: string;
  @Expose()
  from_district_id: number;
  @Expose()
  from_ward_code: string;
}

export class GhnCalculateShippingFeeDto {
  @Expose()
  to_district_id: number;
  @Expose()
  to_ward_code: string;
  @Expose()
  service_type_id: number;
  @Expose()
  height: number;
  @Expose()
  weight: number;
  @Expose()
  length: number;
  @Expose()
  width: number;

  @Expose()
  cod_value: number = 0;
}

export class GhnItemType {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsString()
  @IsNotEmpty()
  code: string;
  @IsNotEmpty()
  quantity: number;
  @IsNotEmpty()
  weight: number;
}

export class GhnCreateOrderDto {
  // Thông tin mặc định
  // from_name: string = 'Shop Console';
  // from_phone: string = '0123456789';
  // from_address: string =
  //   'Số 17A, Đường Cộng Hoà, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh';
  // from_ward_name: string = 'Phường 4';
  // from_district_name: string = 'Quận Tân Bình';
  // from_province_name: string = 'TP. Hồ Chí Minh';
  // service_type_id: number = 2; // hàng hàng nhẹ < 20kg
  // payment_type_id: number = 1; // 1 là shop trả, 2 là người nhận trả
  // required_note: string = RequiredNote.NOT_ALLOW_VIEW; // Không cho xem

  // Thông tin cần nhập
  @IsString()
  @IsNotEmpty()
  to_name: string;

  @IsString()
  @IsNotEmpty()
  to_phone: string;

  @IsString()
  @IsNotEmpty()
  to_address: string;

  @IsString()
  @IsNotEmpty()
  to_ward_code: string;

  @IsNotEmpty()
  to_district_id: number;

  @IsString()
  @IsNotEmpty()
  client_order_code: string;

  @IsNotEmpty()
  cod_amount: number = 0;

  // weight: number; // Sẽ tính sau
  @IsNotEmpty()
  length: number;

  @IsNotEmpty()
  width: number;

  @IsNotEmpty()
  height: number;

  @IsNotEmpty()
  @IsArray()
  items: GhnItemType[];
}
