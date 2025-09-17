import { InjectRedis } from '@nestjs-modules/ioredis';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { KeyStatus } from 'src/constants/key_status.enum';
import { OrderStatus } from 'src/constants/order_status.enum';
import { OrderType } from 'src/constants/order_type.enum';
import { PaymentMethod } from 'src/constants/payment_method.enum';
import { PaymentStatus } from 'src/constants/payment_status.enum';
import { KafkaService } from 'src/modules/kafka/service/kafka.service';
import { MomoService } from 'src/modules/momo/service/momo.service';
import { Order } from 'src/modules/order/entity/order.entity';
import { DigitalKey } from 'src/modules/product/entity/digital_key.entity';
import { Stock } from 'src/modules/product/entity/stock.entity';
import { DataSource, Repository } from 'typeorm';
import { Payment } from '../entity/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly momoService: MomoService,
    private readonly kafkaService: KafkaService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(DigitalKey)
    private readonly digitalKeyRepository: Repository<DigitalKey>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRedis() private readonly redis: Redis,
    private readonly dataSource: DataSource,
  ) {}

  async createMomoPayment(orderId: string, amount: number) {
    await this.momoService.createMomoPayment(orderId, amount);
  }

  handleMomoIPN(data: any) {
    console.log('=== IPN Controller Called ===');
    return this.momoService.handleMomoIPN(data);
  }

  getMomoPaymentStatus(orderId: string) {
    return this.momoService.getMomoPaymentStatus(orderId);
  }

  // Get payment link for digital product order
  async getDigitalPaymentLink(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['user', 'orderItems', 'orderItems.productVariant'],
    });
    if (!order) throw new BadRequestException('Order not found!');

    if (order.status === OrderStatus.CANCELED)
      throw new BadRequestException('This order was canceled!');

    if (order.status !== OrderStatus.PENDING_PAYMENT)
      throw new BadRequestException(
        'Only orders pending payment can create payment links!',
      );

    console.log('Check redis for existing payment link for order', orderId);

    console.log('UserId:', userId);
    console.log('OrderId:', orderId);
    console.log('Redis key:', `MOMO:PAYMENT:${orderId}`);
    const cachedLink = await this.redis.get(`MOMO:PAYMENT:${orderId}`);
    console.log('Cached link:', cachedLink);

    if (!cachedLink) {
      {
        console.log(
          'No cached link, creating new payment link for order',
          orderId,
        );

        throw new BadRequestException('Order was expired! Please order again.');
      }
    }
    return JSON.parse(cachedLink) as {
      partnerCode: string;
      orderId: string;
      requestId: string;
      amount: number;
      responseTime: number;
      message: string;
      resultCode: number;
      payUrl: string;
      shortLink: string;
    };
  }

  async handleMomoPaymentSuccess(orderId: string) {
    // Lấy orderId -> Tìm order -> Xóa expired_at (Chuyển thành null) -> Cập nhật satus thành COMPLETED
    // Nếu là digital -> Cập nhật digital key thành USED và active_at
    // Vào stock và trừ reserved_stock đi 1 và trừ stock đi 1

    const order = await this.orderRepository.findOne({
      where: { id: orderId, status: OrderStatus.PENDING_PAYMENT },
      relations: [
        'orderItems',
        'orderItems.productVariant',
        'orderItems.digitalKey',
      ],
    });

    if (!order) throw new BadRequestException('Order not found!');
    order.expired_at = null;
    order.completed_at = new Date();

    // If digital order, update digital key status to USED and active_at
    if (order.order_type === OrderType.DIGITAL) {
      order.status = OrderStatus.COMPLETED;

      for (const item of order.orderItems) {
        if (item.digitalKey) {
          const digitalKey = await this.digitalKeyRepository.findOne({
            where: { id: item.digitalKey.id, status: KeyStatus.UNUSED },
          });
          if (digitalKey) {
            digitalKey.status = KeyStatus.USED;
            digitalKey.active_at = new Date();
            await this.digitalKeyRepository.save(digitalKey);
          }
        }

        const stock = await this.stockRepository.findOne({
          where: { variant: { id: item.productVariant.id } },
        });

        if (!stock) {
          throw new BadRequestException('Stock not found for variant');
        }

        stock.reserved = Math.max(0, stock.reserved - item.quantity);
        stock.quantity = Math.max(0, stock.quantity - item.quantity);
        await this.stockRepository.save(stock);
      }
    }

    if (order.order_type === OrderType.PHYSICAL) {
      order.status = OrderStatus.PAID;

      for (const item of order.orderItems) {
        const stock = await this.stockRepository.findOne({
          where: { variant: { id: item.productVariant.id } },
        });

        if (!stock) {
          throw new BadRequestException('Stock not found for variant');
        }
      }
    }

    await this.orderRepository.save(order);
    console.log('Order updated to COMPLETED:', order);
  }

  async handleMomoPaymentFailed(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, status: OrderStatus.PENDING_PAYMENT },
      relations: [
        'orderItems',
        'orderItems.productVariant',
        'orderItems.digitalKey',
      ],
    });

    if (!order) throw new BadRequestException('Order not found!');

    order.status = OrderStatus.FAILED;
    order.expired_at = null;

    if (order.order_type === OrderType.DIGITAL) {
      for (const item of order.orderItems) {
        if (item.digitalKey) {
          await this.dataSource.query(
            `
            UPDATE digital_key 
            SET "orderItemId" = NULL, status = 'UNUSED'
            WHERE id = $1
          `,
            [item.digitalKey.id],
          );

          console.log('Released digital key:', item.digitalKey.id);

          const stock = await this.stockRepository.findOne({
            where: { variant: { id: item.productVariant.id } },
          });

          if (!stock) {
            throw new BadRequestException('Stock not found for variant');
          }

          stock.reserved = Math.max(0, stock.reserved - item.quantity);
          await this.stockRepository.save(stock);
        }
      }
    }

    if (order.order_type === OrderType.PHYSICAL) {
      for (const item of order.orderItems) {
        const stock = await this.stockRepository.findOne({
          where: { variant: { id: item.productVariant.id } },
        });
      }
    }
  }

  async createPaymentRecord(data: {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    trans_id: string | null;
    status: PaymentStatus;
    paid_at: Date | null;
  }) {
    console.log('Creating payment record:', data);
    const existedPayment = await this.paymentRepository.findOne({
      where: { order_id: data.orderId },
    });

    if (existedPayment) {
      console.log('Payment record already exists for order:', data.orderId);
      return existedPayment;
    }

    const payment = this.paymentRepository.create({
      method: data.method,
      order_id: data.orderId,
      amount: data.amount,
      paid_at: data.paid_at,
      status: data.status,
      trans_id: data.trans_id,
    });

    await this.paymentRepository.save(payment);
    console.log('Payment record created:', payment);
    return payment;
  }
}
