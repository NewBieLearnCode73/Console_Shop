import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
import { PaymentController } from './controller/payment.controller';
import { PaymentService } from './service/payment.service';
import { MomoModule } from '../momo/momo.module';
import { KafkaModule } from '../kafka/kafka.module';
import { KafkaService } from '../kafka/service/kafka.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]), // VNPay
    MomoModule,
    KafkaModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, KafkaService],
})
export class PaymentModule {}
