import { Controller } from '@nestjs/common';
import { GhnService } from '../service/ghn.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { GhnCreateOrderDto } from '../dto/request/ghn.request';

@Controller()
export class GhnConsumer {
  constructor(private readonly ghnService: GhnService) {}

  // Test event
  @EventPattern('create_shipping_order')
  handleCreateShippingOrder(
    @Payload() data: { ghnCreateOrderDto: GhnCreateOrderDto },
  ) {
    console.log(
      'Received event create_shipping_order: ',
      data.ghnCreateOrderDto,
    );
  }
}
