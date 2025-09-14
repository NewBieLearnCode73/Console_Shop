import { Module } from '@nestjs/common';
import { GhnService } from './service/ghn.service';
import { ConfigModule } from '@nestjs/config';
import { GhnController } from './controller/ghn.controller';
import { KafkaModule } from '../kafka/kafka.module';
import { KafkaService } from '../kafka/service/kafka.service';
import { OrderModule } from '../order/order.module';
import { OrderService } from '../order/service/order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../order/entity/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), ConfigModule, KafkaModule],
  controllers: [GhnController],
  providers: [GhnService, KafkaService],
  exports: [GhnService],
})
export class GiaohangnhanhModule {}
