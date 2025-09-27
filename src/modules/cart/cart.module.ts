import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './service/cart.service';
import { CartItem } from './entity/cart_item.entity';
import { Cart } from './entity/cart.entity';
import { User } from '../user/entity/user.entity';
import { ProductVariant } from '../product/entity/product_variant.entity';
import { CartController } from './controller/cart.controller';
import { Stock } from '../product/entity/stock.entity';
import { Product } from '../product/entity/product.entity';
import { Address } from '../user/entity/address.entity';
import { Order } from '../order/entity/order.entity';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      User,
      ProductVariant,
      Stock,
      Product,
      Address,
      Order,
    ]),
    ConfigModule,
    OrderModule,
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [],
})
export class CartModule {}
