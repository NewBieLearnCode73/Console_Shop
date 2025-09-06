import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import crypto from 'crypto';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { KafkaService } from 'src/modules/kafka/service/kafka.service';
import { PaymentMethod } from 'src/constants/payment_method.enum';
import { PaymentStatus } from 'src/constants/payment_status.enum';
import { T } from 'node_modules/@faker-js/faker/dist/airline-CHFQMWko';

@Injectable()
export class MomoService {
  constructor(
    private readonly configService: ConfigService,
    private readonly kafkaService: KafkaService,
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  generateCreateSignature(amount: string, orderId: string) {
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
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    return crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  verifyIPNSignature(data: {
    accessKey: string;
    amount: number;
    extraData: string;
    message: string;
    orderId: string;
    orderInfo: string;
    orderType: string;
    partnerCode: string;
    payType: string;
    requestId: string;
    responseTime: number;
    resultCode: number;
    transId: string;
    signature: string;
  }) {
    const accessKey = this.configService.getOrThrow<string>('MOMO_ACCESS_KEY');
    const secretKey = this.configService.getOrThrow<string>('MOMO_SECRET_KEY');

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${data.amount}` +
      `&extraData=${data.extraData}` +
      `&message=${data.message}` +
      `&orderId=${data.orderId}` +
      `&orderInfo=${data.orderInfo}` +
      `&orderType=${data.orderType}` +
      `&partnerCode=${data.partnerCode}` +
      `&payType=${data.payType}` +
      `&requestId=${data.requestId}` +
      `&responseTime=${data.responseTime}` +
      `&resultCode=${data.resultCode}` +
      `&transId=${data.transId}`;

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    return data.signature === expectedSignature;
  }

  generateMomoRequestBody(signature: string, orderId: string, amount: number) {
    console.log(this.configService.get<string>('MOMO_IPN_URL'));

    return {
      partnerCode: 'MOMO',
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: orderId,
      amount: Math.round(amount).toString(),
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

  async createMomoPayment(orderId: string, amount: number) {
    const amountStr = Math.round(amount).toString();
    const signature = this.generateCreateSignature(amountStr, orderId);

    console.log('Momo Payment Signature:', signature);

    const requestBody = this.generateMomoRequestBody(
      signature,
      orderId,
      amount,
    );

    const axiosInstance = axios.create({
      baseURL: this.configService.get<string>('MOMO_BASE_URL'),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('Momo Create Payment Request Body:', requestBody);

    try {
      const response = await axiosInstance.post(
        '/v2/gateway/api/create',
        requestBody,
      );
      console.log('Momo Create Payment Response:', response.data);
      // Save to redis
      await this.redis.set(
        `MOMO:PAYMENT:${orderId}`,
        JSON.stringify(response.data),
        'EX',
        60 * 100, // 100 min
      );

      return response.data;
    } catch (error: any) {
      console.error(
        'Failed to create Momo payment:',
        error.response?.data || error.message,
      );
    }
  }

  handleMomoIPN(data: {
    accessKey: string;
    amount: number;
    extraData: string;
    message: string;
    orderId: string;
    orderInfo: string;
    orderType: string;
    partnerCode: string;
    payType: string;
    requestId: string;
    responseTime: number;
    resultCode: number;
    transId: string;
    signature: string;
  }) {
    console.log('Momo IPN Data:', data);

    const isValidSignature = this.verifyIPNSignature(data);

    if (!isValidSignature) {
      throw new BadRequestException('Invalid signature');
    }

    if (data.resultCode === 0) {
      this.kafkaService.sendEvent('momo_payment_success', {
        orderId: data.orderId,
      });

      console.log('OK OK OK resultCode is 0');

      // Tạo Payment
      this.kafkaService.sendEvent('create_payment_record', {
        orderId: data.orderId,
        amount: data.amount,
        method: PaymentMethod.MOMO_WALLET,
        trans_id: data.transId,
        status: PaymentStatus.SUCCESS,
        paid_at: new Date(),
      });

      return 'THÀNH CÔNG!';
    } else {
      console.log('Momo Payment Failed:', data);

      // Tạo Payment
      this.kafkaService.sendEvent('create_payment_record', {
        orderId: data.orderId,
        amount: data.amount,
        method: PaymentMethod.MOMO_WALLET,
        Trans_id: data.transId,
        status: PaymentStatus.FAILED,
        paid_at: new Date(),
      });

      return 'THẤT BẠI!';
    }
  }

  async getMomoPaymentStatus(orderId: string) {
    const accessKey = this.configService.getOrThrow<string>('MOMO_ACCESS_KEY');
    const secretKey = this.configService.getOrThrow<string>('MOMO_SECRET_KEY');
    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: 'MOMO',
      requestId: orderId,
      orderId: orderId,
      signature: expectedSignature,
      lang: 'vi',
    };

    const axiosInstance = axios.create({
      baseURL: this.configService.get<string>('MOMO_BASE_URL'),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    try {
      const response = await axiosInstance.post(
        '/v2/gateway/api/query',
        requestBody,
      );
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get Momo payment status: ${error.message}`,
      );
    }
  }
}
