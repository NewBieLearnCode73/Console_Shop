import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
import { PaymentController } from './controller/payment.controller';
import { PaymentService } from './service/payment.service';
import { VnpayModule, VnpayService } from 'nestjs-vnpay';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashAlgorithm, ignoreLogger } from 'vnpay';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]), // VNPay
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        tmnCode: configService.getOrThrow('VNPay_TMN_CODE'),
        secureSecret: configService.getOrThrow('VNPay_HASH_SECRET'),
        vnpayHost: configService.getOrThrow('VNPay_HOST'),
        hashAlgorithm: HashAlgorithm.SHA512,
        loggerFn: ignoreLogger,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
