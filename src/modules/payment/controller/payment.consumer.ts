import { Controller } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentMethod } from 'src/constants/payment_method.enum';
import { PaymentStatus } from 'src/constants/payment_status.enum';

@Controller()
export class PaymentConsumer {
  constructor(private readonly paymentService: PaymentService) {}

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

  @EventPattern('create_payment_record')
  async createPaymentRecord(
    @Payload()
    payload: {
      orderId: string;
      amount: number;
      method: PaymentMethod;
      trans_id: string;
      status: PaymentStatus;
      paid_at: Date;
    },
  ) {
    await this.paymentService.createPaymentRecord(payload);
  }
}
