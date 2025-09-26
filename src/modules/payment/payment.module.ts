import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
import { PaymentController } from './controller/payment.controller';
import { PaymentService } from './service/payment.service';
import { MomoModule } from '../momo/momo.module';
import { KafkaModule } from '../kafka/kafka.module';
import { KafkaService } from '../kafka/service/kafka.service';
import { Order } from '../order/entity/order.entity';
import { OrderModule } from '../order/order.module';
import { Stock } from '../product/entity/stock.entity';
import { DigitalKey } from '../product/entity/digital_key.entity';
import { PaymentConsumer } from './controller/payment.consumer';
import { User } from '../user/entity/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, Stock, DigitalKey, User]), // VNPay
    MomoModule,
    KafkaModule,
    OrderModule,
    UserModule,
  ],
  controllers: [PaymentController, PaymentConsumer],
  providers: [PaymentService, KafkaService],
})
export class PaymentModule {}
