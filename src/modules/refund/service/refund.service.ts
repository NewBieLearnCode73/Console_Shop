import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Refund } from '../entity/refund.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RefundRequest } from '../entity/refund_request.entity';
import { Order } from 'src/modules/order/entity/order.entity';
import { PaginationRequestDto } from '../../../utils/pagination/pagination_dto';
import { PaginationResult } from 'src/utils/pagination/pagination_result';
import { RefundStatus } from 'src/constants/refund_status.enum';
import { User } from 'src/modules/user/entity/user.entity';
import { Role } from 'src/constants/role.enum';
import { PaymentMethod } from 'src/constants/payment_method.enum';
import { OrderStatus } from 'src/constants/order_status.enum';
import { OrderType } from 'src/constants/order_type.enum';
import { OrderService } from '../../order/service/order.service';
import { GhnService } from 'src/modules/giaohangnhanh/service/ghn.service';
import { Stock } from 'src/modules/product/entity/stock.entity';

@Injectable()
export class RefundService {
  constructor(
    @InjectRepository(RefundRequest)
    private readonly refundRequestRepository: Repository<RefundRequest>,
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly ghnService: GhnService,
    private readonly dataSource: DataSource,
    private readonly orderService: OrderService,
  ) {}

  // ***************************** CUSTOMER *********************************//
  async createRefundRequest(userId: string, orderId: string, reason: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        user: { id: userId },
        order_type: OrderType.PHYSICAL,
      },
      relations: ['refundRequest'],
    });

    if (!order) {
      throw new BadRequestException(
        'Order not found or does not belong to user',
      );
    }

    if (order.refundRequest) {
      throw new BadRequestException(
        'Refund request for this order already exists',
      );
    }

    if (
      order.payment_method === PaymentMethod.COD &&
      order.status !== OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot request refund for COD order not completed!',
      );
    }

    if (order.payment_method === PaymentMethod.MOMO_WALLET) {
      if (
        ![
          OrderStatus.SHIPPED,
          OrderStatus.CONFIRMED,
          OrderStatus.PAID,
        ].includes(order.status)
      ) {
        throw new BadRequestException(
          'Only PAID, CONFIRMED or SHIPPED orders pay with MOMO can request refund!',
        );
      }
    }

    const refundRequest = this.refundRequestRepository.create({
      user: { id: userId },
      order: { id: orderId },
      reason,
    });

    return await this.refundRequestRepository.save(refundRequest);
  }

  async findAllRefundRequestByUser(
    userId: string,
    pagination: PaginationRequestDto,
  ) {
    const { page, limit, order, sortBy } = pagination;

    const [refunds, total] = await this.refundRequestRepository.findAndCount({
      where: { user: { id: userId } },
      order: { [sortBy]: order },
      take: limit,
      skip: (page - 1) * limit,
    });

    return PaginationResult(refunds, total, page, limit);
  }

  // ***************************** ADMIN & MANAGER *********************************//
  async reviewRefundRequest(
    refundRequestId: string,
    status: RefundStatus,
    userId: string,
    reviewNotes: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role === Role.MANAGER) {
      if (![RefundStatus.APPROVED, RefundStatus.REJECTED].includes(status)) {
        throw new BadRequestException(
          'Manager can only approve or reject refund requests!',
        );
      }
    }

    if (user.role === Role.ADMIN) {
      if (status === RefundStatus.COMPLETED) {
        throw new BadRequestException(
          'This refund request need to be approved first!',
        );
      }
    }

    const refundRequest = await this.refundRequestRepository.findOne({
      where: { id: refundRequestId },
      relations: ['order'],
    });

    if (!refundRequest) {
      throw new BadRequestException('Refund request not found');
    }

    if (refundRequest.status !== RefundStatus.PENDING) {
      throw new BadRequestException('Refund request is not pending');
    }

    refundRequest.status = status;
    refundRequest.reviewedBy = user;
    refundRequest.reviewedAt = new Date();
    refundRequest.reviewNotes = reviewNotes;

    return await this.refundRequestRepository.save(refundRequest);
  }

  //   ***************************** ADMIN *********************************//

  async cancelOrderWhenRefunded(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, order_type: OrderType.PHYSICAL },
      relations: ['orderItems', 'orderItems.productVariant', 'refundRequest'],
    });

    if (!order) throw new BadRequestException('Order not found!');

    if (
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.CONFIRMED &&
      order.status !== OrderStatus.SHIPPED
    ) {
      throw new BadRequestException('Order is not in a refundable state!');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        for (const item of order.orderItems) {
          const stock = await manager.findOne(Stock, {
            where: { variant: { id: item.productVariant.id } },
          });
          if (!stock) {
            throw new BadRequestException('Stock information not found!');
          }

          console.log('Stock before refund cancel:', stock);

          if (
            order.status === OrderStatus.PAID ||
            order.status === OrderStatus.CONFIRMED
          ) {
            // Chỉ giảm reserved, chưa động tới quantity
            stock.reserved = Math.max(0, stock.reserved - item.quantity);
          } else if (order.status === OrderStatus.SHIPPED) {
            // Đã trừ kho thật, giờ phải cộng quantity lại
            stock.quantity = Math.max(0, stock.quantity + item.quantity);
          }

          console.log('Stock after refund cancel:', stock);
          await manager.save(stock);
        }

        order.status = OrderStatus.CANCELED;
        await manager.save(order);
      });
    } catch (error) {
      console.error(`Error canceling order ${orderId}:`, error);
    }
  }

  async handleRefund(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, order_type: OrderType.PHYSICAL },
      relations: ['orderItems', 'orderItems.productVariant', 'refundRequest'],
    });

    if (!order) throw new BadRequestException('Order not found!');

    if (order.status === OrderStatus.COMPLETED) {
      // COD đã hoàn tất -> RETURNED (không hoàn kho)
      order.status = OrderStatus.RETURNED;
      return await this.orderRepository.save(order);
    }

    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.CONFIRMED
    ) {
      // Chưa ship -> CANCELED + hoàn kho
      return await this.cancelOrderWhenRefunded(orderId);
    }

    if (order.status === OrderStatus.SHIPPED) {
      // Đã ship -> Gọi GHN cancel, rồi hủy đơn + hoàn kho
      if (!order.order_code) {
        throw new BadRequestException('Order code not found for this order!');
      }

      try {
        console.log(`Canceling GHN order ${order.order_code}...`);
        const result = await this.ghnService.cancelOrder(order.order_code);
        console.log(
          `GHN order ${order.order_code} canceled successfully:`,
          result,
        );
      } catch (error) {
        console.error(`Error canceling GHN order ${order.order_code}:`, error);
      }

      return await this.cancelOrderWhenRefunded(orderId);
    }
  }

  async finalizeRefundRequest(
    refundRequestId: string,
    amount: number,
    userId: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: Role.ADMIN },
    });

    if (!user) {
      throw new BadRequestException('Only admin can finalize refund requests');
    }

    const refundRequest = await this.refundRequestRepository.findOne({
      where: { id: refundRequestId },
      relations: ['order', 'user'],
    });

    if (!refundRequest) {
      throw new BadRequestException('Refund request not found');
    }

    const order = await this.orderRepository.findOne({
      where: { id: refundRequest.order.id },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (refundRequest.status !== RefundStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved refund requests can be finalized',
      );
    }

    if (refundRequest.finalizedAt) {
      throw new BadRequestException(
        'Refund request has already been finalized',
      );
    }

    refundRequest.status = RefundStatus.COMPLETED;
    refundRequest.finalizedAt = new Date();
    refundRequest.finalizedBy = user;

    const refund = this.refundRepository.create({
      amount,
      refundRequest: refundRequest,
    });

    await this.refundRequestRepository.save(refundRequest);

    await this.handleRefund(refundRequest.order.id);

    return await this.refundRepository.save(refund);
  }
}
