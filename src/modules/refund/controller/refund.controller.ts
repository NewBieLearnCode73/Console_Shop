import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from 'src/constants/role.enum';
import { RolesDecorator } from 'src/decorators/role_decorator';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import {
  RefundRequestDto,
  ReviewedRefundRequestDto,
} from '../dto/request/refund-request.dto';
import { RefundService } from '../service/refund.service';
import { FinalizedRefundRequestDto } from '../dto/request/refund-request.dto';

@Controller('api/refunds')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  // ********************** For Customer **********************//
  @Post('/request')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.CUSTOMER])
  async createRefund(
    @Req() req: AuthenticationRequest,
    @Body() refundRequestDto: RefundRequestDto,
  ) {
    await this.refundService.createRefundRequest(
      req.user.id,
      refundRequestDto.order_id,
      refundRequestDto.reason,
    );
  }

  // ********************** For Manager and ADMIN ********************** //
  @Patch('/admin-manager/reviewed')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.MANAGER, Role.ADMIN])
  async markRefundAsReviewed(
    @Req() req: AuthenticationRequest,
    @Body() reviewedRefundRequestDto: ReviewedRefundRequestDto,
  ) {
    return await this.refundService.reviewRefundRequest(
      reviewedRefundRequestDto.refund_request_id,
      reviewedRefundRequestDto.status,
      req.user.id,
      reviewedRefundRequestDto.review_notes,
    );
  }

  // ********************** For ADMIN ********************** //
  @Post('/admin/finalize')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN])
  async finalizeRefund(
    @Req() req: AuthenticationRequest,
    @Body() finalizedRefundRequestDto: FinalizedRefundRequestDto,
  ) {
    return await this.refundService.finalizeRefundRequest(
      finalizedRefundRequestDto.refund_request_id,
      finalizedRefundRequestDto.amount,
      req.user.id,
    );
  }
}
