import { Expose } from 'class-transformer';

export class GhnProvinceResponseDto {
  @Expose()
  ProvinceID: number;
  @Expose()
  ProvinceName: string;
}

export class GhnDistrictResponseDto {
  @Expose()
  DistrictID: number;
  @Expose()
  DistrictName: string;
  @Expose()
  ProvinceID: number;
}

export class GhnWardResponseDto {
  @Expose()
  WardCode: string;
  @Expose()
  WardName: string;
  @Expose()
  DistrictID: number;
}
