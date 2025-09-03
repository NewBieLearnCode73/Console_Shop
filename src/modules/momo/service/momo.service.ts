import { da } from '@faker-js/faker';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPattern, Payload } from '@nestjs/microservices';
import axios from 'axios';
import crypto from 'crypto';
import { KafkaService } from 'src/modules/kafka/service/kafka.service';

@Injectable()
export class MomoService {
  constructor(
    private readonly configService: ConfigService,
    private readonly kafkaService: KafkaService,
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

  async createMomoPayment(orderId: string, amount: number) {
    const signature = this.generateCreateSignature(amount.toString(), orderId);

    console.log('Momo Payment Signature:', signature);

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

      console.log('Momo Create Payment Response:', response.data);

      // return response.data as {
      //   partnerCode: string;
      //   orderId: string;
      //   requestId: string;
      //   amount: number;
      //   responseTime: number;
      //   message: string;
      //   resultCode: number;
      //   payUrl: string;
      //   shortLink: string;
      // };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create Momo payment: ${error.message}`,
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
      // Payment successful
      console.log('Momo Payment Successful:', data);

      return 'THÀNH CÔNG!';
    } else {
      // Payment failed
      console.log('Momo Payment Failed:', data);
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

      return response.data as {
        partnerCode: string;
        orderId: string;
        requestId: string;
        extraData: string;
        amount: number;
        transId: number;
        payType: string;
        resultCode: string;
        refundTrans: [];
        message: string;
        responseTime: number;
        lastUpdated: number;
        signature: unknown;
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get Momo payment status: ${error.message}`,
      );
    }
  }
}
