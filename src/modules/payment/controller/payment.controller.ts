import { Controller, Get, Ip } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';

@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('create-payment-url')
  createPaymentUrl(@Ip() ipAddress: string) {
    const paymentUrl = this.paymentService.createPaymentUrl(
      10000,
      'orderId',
      ipAddress,
    );
    return { paymentUrl };
  }
}
