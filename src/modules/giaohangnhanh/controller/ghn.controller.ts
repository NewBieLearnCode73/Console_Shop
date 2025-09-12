import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { GhnService } from '../service/ghn.service';
import {
  GhnCalculateShippingFeeDto,
  GhnCreateOrderDto,
} from '../dto/request/ghn.request';

@Controller('/api/ghn')
export class GhnController {
  constructor(private readonly ghnService: GhnService) {}

  // Lấy danh sách tỉnh
  @Get('/provinces')
  async getProvinces() {
    return await this.ghnService.getProvinces();
  }

  // Lấy danh sách quận huyện theo tỉnh
  @Get('/districts/:provinceId')
  async getDistricts(@Param('provinceId') provinceId: number) {
    return await this.ghnService.getDistricts(provinceId);
  }

  // Lấy danh sách phường xã theo quận huyện
  @Get('/wards/:districtId')
  async getWards(@Param('districtId') districtId: number) {
    return await this.ghnService.getWards(districtId);
  }

  @Get('/services')
  async getServices(
    @Query('fromDistrictId', ParseIntPipe) fromDistrictId: number,
    @Query('toDistrictId', ParseIntPipe) toDistrictId: number,
  ) {
    return await this.ghnService.getServices(fromDistrictId, toDistrictId);
  }

  @Get('/tracking-url/:trackingCode')
  async getTrackingUrl(@Param('trackingCode') trackingCode: string) {
    return await this.ghnService.getTrackingUrl(trackingCode);
  }

  // Lấy phí vận chuyển
  @Post('/calculate-shipping-fee')
  async calculateShippingFee(
    @Body() ghnCalculateShippingFeeDto: GhnCalculateShippingFeeDto,
  ) {
    return await this.ghnService.calculateShippingFee(
      ghnCalculateShippingFeeDto.to_district_id,
      ghnCalculateShippingFeeDto.to_ward_code,
      ghnCalculateShippingFeeDto.service_type_id,
      ghnCalculateShippingFeeDto.height,
      ghnCalculateShippingFeeDto.weight,
      ghnCalculateShippingFeeDto.length,
      ghnCalculateShippingFeeDto.width,
      ghnCalculateShippingFeeDto.cod_value,
    );
  }

  // Tạo đơn hàng
  @Post('/create-order')
  async createOrder(@Body() orderData: GhnCreateOrderDto) {
    console.log('🚚 Tạo đơn hàng với dữ liệu:', orderData);
    return await this.ghnService.createOrder(orderData);
  }

  // Cancle order
  @Get('/cancel-order/:orderCode')
  async cancelOrder(@Param('orderCode') orderCode: string) {
    return await this.ghnService.cancelOrder(orderCode);
  }

  // Get order info
  @Get('/order-info/:orderCode')
  async getOrderInfo(@Param('orderCode') orderCode: string) {
    return await this.ghnService.getOrderInfo(orderCode);
  }

  // ward code:
}
