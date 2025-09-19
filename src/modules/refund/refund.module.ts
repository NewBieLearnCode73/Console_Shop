import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundController } from './controller/refund.controller';
import { Order } from '../order/entity/order.entity';
import { RefundRequest } from './entity/refund_request.entity';
import { User } from '../user/entity/user.entity';
import { Refund } from './entity/refund.entity';
import { RefundService } from './service/refund.service';
import { OrderModule } from '../order/order.module';
import { Stock } from '../product/entity/stock.entity';
import { GiaohangnhanhModule } from '../giaohangnhanh/giaohangnhanh.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, RefundRequest, User, Refund, Stock]),
    OrderModule,
    GiaohangnhanhModule,
  ],
  controllers: [RefundController],
  providers: [RefundService],
  exports: [],
})
export class RefundModule {}
