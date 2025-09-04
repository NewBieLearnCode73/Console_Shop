import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';

@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('momo/ipn')
  handleMomoIPN(@Body() body: any) {
    console.log('=== IPN Controller Called ===');
    return this.paymentService.handleMomoIPN(body);
  }

  @Get('momo/status')
  getMomoPaymentStatus(@Query('orderId') orderId: string) {
    return this.paymentService.getMomoPaymentStatus(orderId);
  }

  // Route có param đặt sau
  @Get(':orderId/payment-link')
  @UseGuards(JwtAuthGuard)
  async getDigitalPaymentLink(
    @Param('orderId') orderId: string,
    @Request() req: AuthenticationRequest,
  ) {
    return await this.paymentService.getDigitalPaymentLink(
      req.user.id,
      orderId,
    );
  }

  @EventPattern('create_momo_payment')
  async createMomoPayment(
    @Payload() payload: { orderId: string; amount: number },
  ) {
    await this.paymentService.createMomoPayment(
      payload.orderId,
      payload.amount,
    );
  }

  @EventPattern('momo_payment_success')
  async handleMomoPaymentSuccess(@Payload() payload: { orderId: string }) {
    await this.paymentService.handleMomoPaymentSuccess(payload.orderId);
  }
}
