import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MomoService } from 'src/modules/momo/service/momo.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly momoService: MomoService,
  ) {}

  async createMomoPayment(orderId: string, amount: number) {
    return this.momoService.createMomoPayment(orderId, amount);
  }
}
