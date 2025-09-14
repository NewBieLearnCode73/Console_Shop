import { Expose } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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
  @IsOptional()
  weight: number;
}

export class GhnCreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  order_id: string;

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
