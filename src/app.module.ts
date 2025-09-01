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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
