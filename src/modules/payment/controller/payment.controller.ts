import { Controller, Get, Ip } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';

@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('momo')
  async createMomoPayment() {
    return this.paymentService.createMomoPayment('ChieuChieu123', 10000);
  }
}
