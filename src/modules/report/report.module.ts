import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './controller/report.controller';
import { ReportService } from './service/report.service';
import { User } from '../user/entity/user.entity';
import { Payment } from '../payment/entity/payment.entity';
import { Order } from '../order/entity/order.entity';
import { OrderItem } from '../order/entity/order_item.entity';
import { Product } from '../product/entity/product.entity';
import { ProductVariant } from '../product/entity/product_variant.entity';
import { Category } from '../product/entity/category.entity';
import { Brand } from '../product/entity/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Payment,
      Order,
      OrderItem,
      Product,
      ProductVariant,
      Category,
      Brand,
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
