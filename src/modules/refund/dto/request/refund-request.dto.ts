import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { RefundStatus } from 'src/constants/refund_status.enum';

export class FindRefundRequestsByOrderId {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;
}

export class RefundRequestDto {
  @IsNotEmpty()
  @IsUUID()
  order_id: string;

  @IsNotEmpty()
  reason: string;
}

export class ReviewedRefundRequestDto {
  @IsNotEmpty()
  @IsUUID()
  refund_request_id: string;

  @IsEnum(RefundStatus)
  status: RefundStatus;

  @IsNotEmpty()
  @IsString()
  review_notes: string;
}

export class FinalizedRefundRequestDto {
  @IsNotEmpty()
  @IsUUID()
  refund_request_id: string;

  @IsNotEmpty()
  amount: number;
}
