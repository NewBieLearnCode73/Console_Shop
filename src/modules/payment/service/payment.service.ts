import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VnpayService } from 'nestjs-vnpay';
import { dateFormat, ProductCode, VnpLocale } from 'vnpay';

@Injectable()
export class PaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService,
  ) {}

  createPaymentUrl(amount: number, orderId: string, ipAddress: string) {
    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ipAddress,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Payment for order ${orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date(Date.now())),
      vnp_ExpireDate: dateFormat(new Date(Date.now() + 30 * 1000)), // 30 seconds from now
      vnp_ReturnUrl: this.configService.getOrThrow('VNPay_RETURN_URL'),
      vnp_BankCode: 'VNPAYQR',
    });

    return paymentUrl;
  }
}
