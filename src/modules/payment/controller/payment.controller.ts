import { Body, Controller, Get, Ip, Post, Query } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern('create_momo_payment')
  async createMomoPayment(
    @Payload() payload: { orderId: string; amount: string },
  ) {
    console.log('📥 Received Kafka payload:', payload);
  }

  @Post('momo/ipn')
  async handleMomoIPN(@Body() body: any) {
    return this.paymentService.handleMomoIPN(body);
  }

  @Get('momo/status')
  async getMomoPaymentStatus(@Query('orderId') orderId: string) {
    return await this.paymentService.getMomoPaymentStatus(orderId);
  }
}
