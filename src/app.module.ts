import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RefundModule } from './modules/refund/refund.module';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CartModule } from './modules/cart/cart.module';
import { KafkaModule } from './modules/kafka/kafka.module';
import { MomoModule } from './modules/momo/momo.module';
import { GiaohangnhanhModule } from './modules/giaohangnhanh/giaohangnhanh.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'reset-password-limit',
        limit: 3,
        ttl: 60 * 60 * 1000, // 1 hour
      },
    ]),

    AuthModule,
    UserModule,
    OrderModule,
    ProductModule,
    PaymentModule,
    RefundModule,
    DatabaseModule,
    SupabaseModule,
    CartModule,
    KafkaModule,
    MomoModule,
    GiaohangnhanhModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
