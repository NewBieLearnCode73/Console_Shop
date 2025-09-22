import { Controller, Logger } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentMethod } from 'src/constants/payment_method.enum';
import { PaymentStatus } from 'src/constants/payment_status.enum';

@Controller()
export class PaymentConsumer {
  private readonly logger = new Logger(PaymentConsumer.name);

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
    try {
      this.logger.log(
        `Processing momo payment success for order: ${payload.orderId}`,
      );
      await this.paymentService.handleMomoPaymentSuccess(payload.orderId);
      this.logger.log(
        `Successfully processed momo payment success for order: ${payload.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing momo payment success for order: ${payload.orderId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  @EventPattern('momo_payment_failed')
  async handleMomoPaymentFailed(@Payload() payload: { orderId: string }) {
    await this.paymentService.handleMomoPaymentFailed(payload.orderId);
  }

  @EventPattern('create_payment_record')
  async createPaymentRecord(
    @Payload()
    payload: {
      orderId: string;
      amount: number;
      method: PaymentMethod;
      trans_id: string | null;
      status: PaymentStatus;
      paid_at: Date | null;
    },
  ) {
    await this.paymentService.createPaymentRecord(payload);
  }

  @EventPattern('update_payment_status')
  async updatePaymentStatus(
    @Payload() payload: { orderId: string; status: PaymentStatus },
  ) {
    await this.paymentService.updatePaymentStatus(
      payload.orderId,
      payload.status,
    );
  }
}
