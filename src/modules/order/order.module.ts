import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderAddress } from './entity/order_address.entity';
import { OrderItem } from './entity/order_item.entity';
import { OrderController } from './controller/oder.controller';
import { OrderService } from './service/order.service';
import { User } from '../user/entity/user.entity';
import { ProductVariant } from '../product/entity/product_variant.entity';
import { Stock } from '../product/entity/stock.entity';
import { Address } from '../user/entity/address.entity';
import { KafkaModule } from '../kafka/kafka.module';
import { KafkaService } from '../kafka/service/kafka.service';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';
import { GiaohangnhanhModule } from '../giaohangnhanh/giaohangnhanh.module';
import { Payment } from '../payment/entity/payment.entity';
import { Cart } from '../cart/entity/cart.entity';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderAddress,
      OrderItem,
      User,
      ProductVariant,
      Stock,
      Address,
      Payment,
    ]),
    KafkaModule,
    GiaohangnhanhModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, KafkaService, JwtCookieAuthGuard],
  exports: [OrderService],
})
export class OrderModule {}
