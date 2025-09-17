import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';

@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('momo/return-url')
  returnUrlMomo(@Body() body: any) {
    console.log('=== Return URL Controller Called ===');
    return this.paymentService.handleMomoIPN(body);
  }

  @Post('momo/ipn')
  handleMomoIPN(@Body() body: any) {
    console.log('=== IPN Controller Called ===');
    console.log(body);
    return this.paymentService.handleMomoIPN(body);
  }

  @Get('momo/status')
  getMomoPaymentStatus(@Query('orderId') orderId: string) {
    return this.paymentService.getMomoPaymentStatus(orderId);
  }

  // Route có param đặt sau
  @Get('payment-link')
  @UseGuards(JwtCookieAuthGuard)
  async getDigitalPaymentLink(
    @Query('orderId') orderId: string,
    @Request() req: AuthenticationRequest,
  ) {
    return await this.paymentService.getDigitalPaymentLink(
      req.user.id,
      orderId,
    );
  }
}
