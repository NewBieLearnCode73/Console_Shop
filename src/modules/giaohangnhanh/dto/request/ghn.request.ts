import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CategoryDto {
  @IsString()
  level1: string;
}

class ItemDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsObject()
  @ValidateNested()
  @Type(() => CategoryDto)
  category: CategoryDto;
}

export class CreateGhnOrderDto {
  @IsNumber()
  payment_type_id: number;

  @IsString()
  note: string;

  @IsString()
  required_note: string;

  @IsString()
  return_phone: string;

  @IsString()
  return_address: string;

  @IsOptional()
  @IsNumber()
  return_district_id: number | null;

  @IsString()
  return_ward_code: string;

  @IsString()
  client_order_code: string;

  @IsString()
  from_name: string;

  @IsString()
  from_phone: string;

  @IsString()
  from_address: string;

  @IsString()
  from_ward_name: string;

  @IsString()
  from_district_name: string;

  @IsString()
  from_province_name: string;

  @IsString()
  to_name: string;

  @IsString()
  to_phone: string;

  @IsString()
  to_address: string;

  @IsString()
  to_ward_name: string;

  @IsString()
  to_district_name: string;

  @IsString()
  to_province_name: string;

  @IsNumber()
  cod_amount: number;

  @IsString()
  content: string;

  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  cod_failed_amount: number;

  @IsOptional()
  @IsNumber()
  pick_station_id?: number;

  @IsOptional()
  @IsNumber()
  deliver_station_id?: number | null;

  @IsNumber()
  insurance_value: number;

  @IsNumber()
  service_type_id: number;

  @IsOptional()
  coupon?: string | null;

  @IsOptional()
  @IsNumber()
  pickup_time?: number;

  @IsArray()
  pick_shift: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}
