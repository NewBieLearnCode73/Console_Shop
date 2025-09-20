import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { OrderType } from 'src/constants/order_type.enum';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';

export class GetSalesOverviewDto {
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(String(value)) : undefined))
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(String(value)) : undefined))
  @IsInt()
  @Min(2000)
  year?: number;
}

export class GetSalesByDateDto extends PaginationRequestDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class GetSalesByMonthDto extends PaginationRequestDto {
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(String(value)) : undefined))
  @IsInt()
  @Min(2000)
  year?: number;
}

export class GetTopSellingProductsDto extends PaginationRequestDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetSalesWithFiltersDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;
}

// **********************FOR ADMIN REPORTS - DTOs******************************* *//

export class GetOverallSalesDto {
  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;
}

export class GetSalesByProductDto extends PaginationRequestDto {
  @IsOptional()
  productType?: string; // DEVICE, CARD_PHYSICAL, CARD_DIGITAL_KEY
}

export class GetSalesByCustomerDto extends PaginationRequestDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;
}

export class GetSalesByTimeRangeDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class GetProfitReportDto {
  @IsOptional()
  productType?: string; // DEVICE, CARD_PHYSICAL, CARD_DIGITAL_KEY

  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;
}

export class GetVariantProfitDto {
  @IsUUID()
  variantId: string;
}
