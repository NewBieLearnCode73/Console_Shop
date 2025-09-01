import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderAddress } from './entity/order_address.entity';
import { OrderItem } from './entity/order_item.entity';
import { OrderController } from './controller/oder.controller';
import { OrderService } from './service/order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderAddress, OrderItem])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
