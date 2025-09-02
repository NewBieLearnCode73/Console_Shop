import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
import { PaymentController } from './controller/payment.controller';
import { PaymentService } from './service/payment.service';
import { MomoModule } from '../momo/momo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]), // VNPay
    MomoModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
