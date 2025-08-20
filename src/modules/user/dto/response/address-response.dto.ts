import { Expose } from 'class-transformer';

export class DefaultAddressResponseDto {
  @Expose()
  id: string;
  @Expose()
  to_name: string;
  @Expose()
  to_phone: string;
  @Expose()
  to_address: string;
  @Expose()
  to_ward_code: string;
  @Expose()
  to_district_id: string;
  @Expose()
  to_province_name: string;
}

export class CreateAddressResponseDto {
  @Expose()
  id: string;
  @Expose()
  to_name: string;
  @Expose()
  to_phone: string;
  @Expose()
  to_address: string;
  @Expose()
  to_ward_code: string;
  @Expose()
  to_district_id: string;
  @Expose()
  to_province_name: string;
}
