import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Ghn from 'giaohangnhanh';
import {
  GhnDistrictResponseDto,
  GhnProvinceResponseDto,
  GhnWardResponseDto,
} from '../dto/response/ghn.response';
import { plainToInstance } from 'class-transformer';
import { GhnCreateOrderDto, GhnItemType } from '../dto/request/ghn.request';
import { OrderService } from 'src/modules/order/service/order.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/modules/order/entity/order.entity';
import { OrderStatus } from 'src/constants/order_status.enum';

@Injectable()
export class GhnService {
  private ghn: Ghn;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    this.ghn = new Ghn({
      host: this.configService.getOrThrow<string>('GHN_HOST'),
      token: this.configService.getOrThrow<string>('GHN_TOKEN'),
      shopId: Number(this.configService.getOrThrow<string>('GHN_SHOP_ID')),
      trackingHost: this.configService.get('GHN_TRACKING_HOST'),
      testMode: true,
    });
  }

  // Lấy danh sách tỉnh
  async getProvinces() {
    const provinces = await this.ghn.address.getProvinces();
    return plainToInstance(GhnProvinceResponseDto, provinces, {
      excludeExtraneousValues: true,
    });
  }

  // Lấy danh sách quận huyện theo tỉnh
  async getDistricts(provinceId: number) {
    const districts = await this.ghn.address.getDistricts(provinceId);
    return plainToInstance(GhnDistrictResponseDto, districts, {
      excludeExtraneousValues: true,
    });
  }

  // Lấy danh sách phường xã theo quận huyện
  async getWards(districtId: number) {
    const wards = await this.ghn.address.getWards(districtId);
    return plainToInstance(GhnWardResponseDto, wards, {
      excludeExtraneousValues: true,
    });
  }

  // Lấy dịch vụ vận chuyển fromDistrictId: number, toDistrictId: number
  async getServices(fromDistrictId: number, toDistrictId: number) {
    const services = await this.ghn.calculateFee.getServiceList(
      fromDistrictId,
      toDistrictId,
    );
    return services;
  }

  // Lấy phí vận chuyển
  async calculateShippingFee(
    toDistrictId: number,
    toWardCode: string,
    serviceTypeId: number,
    height: number,
    weight: number,
    length: number,
    width: number,
    cod_value: number,
  ): Promise<{
    total: number;
    service_fee: number;
    insurance_fee: number;
    pick_station_fee: number;
    coupon_value: number;
    r2s_fee: number;
    document_return: number;
    double_check: number;
    cod_fee: number;
    pick_remote_areas_fee: number;
    deliver_remote_areas_fee: number;
    cod_failed_fee: number;
  }> {
    return await this.ghn.calculateFee.calculateShippingFee({
      to_district_id: toDistrictId,
      to_ward_code: toWardCode,
      service_type_id: serviceTypeId,
      height,
      weight,
      length,
      width,
      cod_value,
    });
  }

  calculateTotalWeight(items: GhnItemType[]): number {
    if (!items || items.length === 0) return 0;

    return items.reduce(
      (total, item) => total + item.weight * item.quantity,
      0,
    );
  }

  // Tạo đơn hàng với ghn
  async createOrder(ghnCreateOrderDto: GhnCreateOrderDto) {
    const { items, ...rest } = ghnCreateOrderDto;
    const totalWeight = this.calculateTotalWeight(items);

    const order = await this.orderRepository.findOne({
      where: { id: rest.order_id, status: OrderStatus.CONFIRMED },
    });

    if (!order) {
      throw new BadRequestException('Order not found or not confirmed');
    }

    const orderCreated = await this.ghn.order.createOrder({
      from_name: 'Shop Console',
      from_phone: '0945046925',
      from_address:
        'Số 17A, Đường Cộng Hoà, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh',
      from_ward_name: 'Phường 4',
      from_district_name: 'Quận Tân Bình',
      from_province_name: 'TP. Hồ Chí Minh',
      service_type_id: 2, // hàng hàng nhẹ < 20kg
      payment_type_id: 1, // 1 là shop trả, 2 là người nhận trả
      required_note: 'KHONGCHOXEMHANG', // Không cho xem
      client_order_code: rest.order_id,
      to_name: rest.to_name,
      to_phone: rest.to_phone,
      to_address: rest.to_address,
      to_ward_code: rest.to_ward_code,
      to_district_id: rest.to_district_id,
      cod_amount: rest.cod_amount,
      weight: totalWeight,
      length: rest.length,
      width: rest.width,
      height: rest.height,
      items: items,
    });

    console.log('Order Created (typeof): ', typeof orderCreated);
    console.log('Order Created (raw): ', orderCreated);
    console.log(
      'Order Created (json): ',
      JSON.stringify(orderCreated, null, 2),
    );

    return orderCreated;
  }

  async getTrackingUrl(trackingCode: string) {
    return await this.ghn.order.getTrackingUrl(trackingCode);
  }

  async cancelOrder(orderCode: string) {
    return await this.ghn.order.cancelOrder({
      orderCodes: [orderCode],
    });
  }

  async getOrderInfo(orderCode: string) {
    return await this.ghn.order.orderInfo({
      order_code: orderCode,
    });
  }
}
