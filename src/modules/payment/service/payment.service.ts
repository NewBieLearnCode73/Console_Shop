import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaService } from 'src/modules/kafka/service/kafka.service';
import { MomoService } from 'src/modules/momo/service/momo.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly momoService: MomoService,
    private readonly kafkaService: KafkaService,
  ) {}

  async createMomoPayment(orderId: string, amount: number) {
    await this.momoService.createMomoPayment(orderId, amount);
  }

  async handleMomoIPN(data: any) {
    return this.momoService.handleMomoIPN(data);
  }

  async getMomoPaymentStatus(orderId: string) {
    return await this.momoService.getMomoPaymentStatus(orderId);
  }
}
