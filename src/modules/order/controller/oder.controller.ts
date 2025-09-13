import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  OrderDigitalBuyNowRequestDto,
  OrderPhysicalBuyNowRequestDto,
} from '../dto/request/order-request.dto';
import { OrderService } from '../service/order.service';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';

@Controller('api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/digital_keys/:orderId')
  @UseGuards(JwtCookieAuthGuard)
  async getDigitalKeys(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.orderService.getDigitalKeys(req.user.id, orderId);
  }

  @Post('digital/buy-now')
  @UseGuards(JwtCookieAuthGuard)
  async digitalBuyNow(
    @Req() req: AuthenticationRequest,
    @Body() orderDigitalBuyNowRequestDto: OrderDigitalBuyNowRequestDto,
  ) {
    return await this.orderService.digitalProductBuyNow(
      req.user.id,
      orderDigitalBuyNowRequestDto,
    );
  }

  @Post('physical/buy-now')
  @UseGuards(JwtCookieAuthGuard)
  async physicalBuyNow(
    @Req() req: AuthenticationRequest,
    @Body() orderPhysicalBuyNowRequestDto: OrderPhysicalBuyNowRequestDto,
  ) {
    return await this.orderService.physicalProductBuyNow(
      req.user.id,
      orderPhysicalBuyNowRequestDto,
    );
  }

  // @Post('cancel-order/:orderId')
  // @UseGuards(JwtCookieAuthGuard)
  // async cancelOrder(
  //   @Param('orderId') orderId: string,
  //   @Req() req: AuthenticationRequest,
  // ) {
  //   return await this.orderService.cancelOrder(req.user.id, orderId);
  // }
}
