import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ChangeOrderAddressRequestDto,
  FindAllOrdersByCustomerIdRequestDto,
  OrderDigitalBuyNowRequestDto,
  OrderDigitalKeyRequestDto,
  OrderIdRequestDto,
  OrderPhysicalBuyNowRequestDto,
  OrderStatusRequestDto,
} from '../dto/request/order-request.dto';
import { OrderService } from '../service/order.service';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';
import { RolesDecorator } from 'src/decorators/role_decorator';
import { Role } from 'src/constants/role.enum';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';
import { OrderStatus } from 'src/constants/order_status.enum';

@Controller('api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  //**********************FOR CUSTOMER - START********************************/

  @Get('/digital_keys')
  @UseGuards(JwtCookieAuthGuard)
  async getDigitalKeys(
    @Query() orderDigitalKeyRequestDto: OrderDigitalKeyRequestDto,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.orderService.getDigitalKeys(
      req.user.id,
      orderDigitalKeyRequestDto.orderId,
      orderDigitalKeyRequestDto.product_variant_id,
    );
  }

  @Get('/:orderId')
  @UseGuards(JwtCookieAuthGuard)
  async getOrderDetails(
    @Param() orderId: OrderIdRequestDto,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.orderService.getOrderByIdForUser(
      req.user.id,
      orderId.orderId,
    );
  }

  @Get()
  @UseGuards(JwtCookieAuthGuard)
  async getAllOrders(
    @Req() req: AuthenticationRequest,
    @Query() paginationRequestDto: PaginationRequestDto,
  ) {
    return await this.orderService.getAllOrdersByUser(
      req.user.id,
      paginationRequestDto,
    );
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

  @Patch('change-address/:orderId')
  @UseGuards(JwtCookieAuthGuard)
  async changeOrderAddress(
    @Req() req: AuthenticationRequest,
    @Param() orderId: OrderIdRequestDto,
    @Body() changeOrderAddressRequestDto: ChangeOrderAddressRequestDto,
  ) {
    return await this.orderService.changeOrderAddress(
      req.user.id,
      orderId.orderId,
      changeOrderAddressRequestDto.addressId,
    );
  }

  @Put('cancel-order/:orderId')
  @UseGuards(JwtCookieAuthGuard)
  async cancelOrder(
    @Param() orderId: OrderIdRequestDto,
    @Req() req: AuthenticationRequest,
  ) {
    return await this.orderService.cancelOrderByUser(
      req.user.id,
      orderId.orderId,
    );
  }

  // **********************FOR CUSTOMER - END******************************* */

  // **********************FOR ADMIN AND MANAGER - START******************************* */

  @Get('/admin-manager/find-all')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  async getOrderStatus(@Query() paginationRequestDto: PaginationRequestDto) {
    return await this.orderService.getAllOrders(paginationRequestDto);
  }

  @Get('/admin-manager/customer-orders/:customerId')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  async getOrdersByCustomerId(
    @Param()
    findAllOrdersByCustomerIdRequestDto: FindAllOrdersByCustomerIdRequestDto,
    @Query() paginationRequestDto: PaginationRequestDto,
    @Query('status', new ParseEnumPipe(OrderStatus, { optional: true }))
    status?: OrderStatus,
  ) {
    return await this.orderService.getOrdersByCustomerId(
      findAllOrdersByCustomerIdRequestDto.customerId,
      paginationRequestDto,
      status,
    );
  }

  @Get('/admin-manager/find-by-status/:status')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  async getOrdersByStatus(
    @Param() status: OrderStatusRequestDto,
    @Query() paginationRequestDto: PaginationRequestDto,
  ) {
    return await this.orderService.getOrdersByStatus(
      status.status,
      paginationRequestDto,
    );
  }

  @Get('/admin-manager/:orderId')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  async getOrderById(@Param() orderId: OrderIdRequestDto) {
    return await this.orderService.getOrderById(orderId.orderId);
  }

  @Patch('/admin-manager/confirm-order/:orderId')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  async confrimOrder(@Param() orderId: OrderIdRequestDto) {
    return await this.orderService.confirmOrder(orderId.orderId);
  }

  @Patch('/admin-manager/ship-order/:orderId')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  async shipOrder(@Param() orderId: OrderIdRequestDto) {
    return await this.orderService.shipOrder(orderId.orderId);
  }

  @Patch('/admin-manager/cancel/:orderId')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN, Role.MANAGER])
  async cancelShippedOrderByAdmin(@Param() orderId: OrderIdRequestDto) {
    return await this.orderService.cancelOrder(orderId.orderId);
  }

  // **********************FOR ADMIN AND MANAGER - END******************************* */

  // **********************FOR ADMIN - START******************************* */
  @Patch('/admin/deliverd-order/:orderId')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN])
  async deliverdOrder(@Param() orderId: OrderIdRequestDto) {
    return await this.orderService.deliverdOrder(orderId.orderId);
  }

  @Patch('/admin/completed-order/:orderId')
  @UseGuards(JwtCookieAuthGuard)
  @RolesDecorator([Role.ADMIN])
  async completedOrder(@Param() orderId: OrderIdRequestDto) {
    return await this.orderService.completeOrder(orderId.orderId);
  }

  // @Get('/admin/return-order/:orderId')
  // @UseGuards(JwtCookieAuthGuard)
  // @RolesDecorator([Role.ADMIN])
  // async returnOrder(@Param() orderId: OrderIdRequestDto) {
  //   return await this.orderService.returnOrder(orderId.orderId);
  // }
  // **********************FOR ADMIN - END******************************* */
}
