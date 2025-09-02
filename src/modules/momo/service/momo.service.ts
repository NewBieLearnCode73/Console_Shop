import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import crypto from 'crypto';

@Injectable()
export class MomoService {
  constructor(private readonly configService: ConfigService) {}

  generateSignature(amount: string, orderId: string) {
    const accessKey = this.configService.getOrThrow<string>('MOMO_ACCESS_KEY');
    const secretKey = this.configService.getOrThrow<string>('MOMO_SECRET_KEY');
    const redirectUrl =
      this.configService.getOrThrow<string>('MOMO_REDIRECT_URL');
    const ipnUrl = this.configService.getOrThrow<string>('MOMO_IPN_URL');
    const orderInfo = 'Pay with Momo';
    const partnerCode = 'MOMO';
    const requestType = 'payWithMethod';
    const requestId = orderId;
    const extraData = '';

    const rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;

    return crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  generateMomoRequestBody(signature: string, orderId: string, amount: number) {
    return {
      partnerCode: 'MOMO',
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: orderId,
      amount: amount,
      orderId: orderId,
      orderInfo: 'Pay with Momo',
      redirectUrl: this.configService.get<string>('MOMO_REDIRECT_URL'),
      ipnUrl: this.configService.get<string>('MOMO_IPN_URL'),
      lang: 'vi',
      requestType: 'payWithMethod',
      autoCapture: true,
      extraData: '',
      orderGroupId: '',
      signature: signature,
    };
  }

  // Create momo payment
  async createMomoPayment(orderId: string, amount: number) {
    const signature = this.generateSignature(amount.toString(), orderId);
    const requestBody = this.generateMomoRequestBody(
      signature,
      orderId,
      amount,
    );

    const axiosInstant = axios.create({
      baseURL: this.configService.get<string>('MOMO_BASE_URL'),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(requestBody)),
      },
    });

    try {
      const response = await axiosInstant.post(
        '/v2/gateway/api/create',
        requestBody,
      );
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create Momo payment: ${error.message}`,
      );
    }
  }
}
