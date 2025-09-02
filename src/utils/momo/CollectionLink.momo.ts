import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

const configService = new ConfigService();

//https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
//parameters
const accessKey = configService.getOrThrow<string>('MOMO_ACCESS_KEY');
const secretKey = configService.getOrThrow<string>('MOMO_SECRET_KEY');
const redirectUrl = configService.getOrThrow<string>('MOMO_REDIRECT_URL');
const ipnUrl = configService.getOrThrow<string>('MOMO_IPN_URL');
const orderInfo = 'pay with MoMo';
const partnerCode = 'MOMO';
const requestType = 'payWithMethod';
const amount = '10000';
const orderId = partnerCode + new Date().getTime();
const requestId = orderId;
const extraData = '';
const orderGroupId = '';
const autoCapture = true;
const lang = 'vi';

//before sign HMAC SHA256 with format
//accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
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

//signature
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(rawSignature)
  .digest('hex');

//json object send to MoMo endpoint
const requestBody = JSON.stringify({
  partnerCode: partnerCode,
  partnerName: 'Test',
  storeId: 'MomoTestStore',
  requestId: requestId,
  amount: amount,
  orderId: orderId,
  orderInfo: orderInfo,
  redirectUrl: redirectUrl,
  ipnUrl: ipnUrl,
  lang: lang,
  requestType: requestType,
  autoCapture: autoCapture,
  extraData: extraData,
  orderGroupId: orderGroupId,
  signature: signature,
});

export const RequestBodyMomo = requestBody;
