import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateAddressRequestDto {
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

  @IsString()
  @IsNotEmpty()
  to_district_id: string;

  @IsString()
  @IsNotEmpty()
  to_province_name: string;
}

export class CreateAddressRequestDto {
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

  @IsString()
  @IsNotEmpty()
  to_district_id: string;

  @IsString()
  @IsNotEmpty()
  to_province_name: string;
}

export class setDefaultAddressRequestDto {
  @IsUUID()
  @IsNotEmpty()
  addressId: string;
}
