import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderDigitalBuyNowRequestDto } from '../dto/request/order-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, IsNull } from 'typeorm';
import { Order } from '../entity/order.entity';
import { OrderItem } from '../entity/order_item.entity';
import { OrderAddress } from '../entity/order_address.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { ProductVariant } from 'src/modules/product/entity/product_variant.entity';
import { Address } from 'src/modules/user/entity/address.entity';
import { Stock } from 'src/modules/product/entity/stock.entity';
import { ProductType } from 'src/constants/product_type.enum';
import { OrderType } from 'src/constants/order_type.enum';
import { OrderStatus } from 'src/constants/order_status.enum';
import { KafkaService } from 'src/modules/kafka/service/kafka.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { DigitalKey } from 'src/modules/product/entity/digital_key.entity';
import { KeyStatus } from 'src/constants/key_status.enum';
import { decryptKeyGame } from 'src/utils/crypto_helper';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderAddress)
    private readonly orderAddressRepository: Repository<OrderAddress>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    private readonly kafkaService: KafkaService,
    private readonly dataSource: DataSource,

    @InjectRedis() private readonly redis: Redis,
  ) {}
  // Get digital keys for an order
  async getDigitalKeys(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['orderItems', 'orderItems.digitalKey'],
    });
    if (!order)
      throw new BadRequestException('Order not found! Or not your order');
    if (order.order_type !== OrderType.DIGITAL)
      throw new BadRequestException('Not a digital product order!');
    if (order.status !== OrderStatus.COMPLETED)
      throw new BadRequestException('Order is not paid!');

    // Return only items with digital keys
    const digital_key = order.orderItems
      .filter((item) => item.digitalKey)
      .map((item) => item.digitalKey);

    return digital_key.map((key) => ({
      key_code: decryptKeyGame(key.key_code),
    }));
  }

  // BUY NOW FOR DIGITAL PRODUCT (GAME KEY)
  async digitalProductBuyNow(
    userId: string,
    orderDigitalBuyNowRequestDto: OrderDigitalBuyNowRequestDto,
  ) {
    const { productVariantId } = orderDigitalBuyNowRequestDto;
    const productVariant = await this.productVariantRepository.findOne({
      where: { id: productVariantId },
      relations: ['product'],
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found!');
    if (
      !productVariant ||
      productVariant.product.product_type !== ProductType.CARD_DIGITAL_KEY
    )
      throw new BadRequestException(
        'Product variant not found or invalid digital product!',
      );

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const stock = await manager
        .getRepository(Stock)
        .createQueryBuilder('stock')
        .setLock('pessimistic_write')
        .innerJoinAndSelect('stock.variant', 'variant')
        .andWhere('variant.id = :variantId', { variantId: productVariantId })
        .getOne();

      if (!stock)
        throw new BadRequestException(
          'Stock information not found for product variant!',
        );

      const available = stock.quantity - stock.reserved;
      if (available <= 0)
        throw new BadRequestException(
          'Insufficient stock for product variant!',
        );

      stock.reserved += 1;
      await manager.getRepository(Stock).save(stock);

      // Find 1 available digital key
      const availableKey = await manager.getRepository(DigitalKey).findOne({
        where: {
          variant: { id: productVariant.id },
          status: KeyStatus.UNUSED,
          orderItem: IsNull(),
        },
      });

      if (!availableKey)
        throw new BadRequestException('No available digital keys in stock!');

      const orderItem = await manager.getRepository(OrderItem).save({
        quantity: 1,
        price: productVariant.price,
        productVariant,
        digitalKey: availableKey,
      });

      const sub_total = orderItem.price * orderItem.quantity;

      const expiredAt = new Date();
      expiredAt.setMinutes(expiredAt.getMinutes() + 100);

      const order = manager.getRepository(Order).create({
        sub_total,
        shipping_fee: 0,
        total_amount: sub_total,
        order_type: OrderType.DIGITAL,
        orderItems: [orderItem],
        user,
        expired_at: expiredAt,
      });

      const savedOrder = await manager.getRepository(Order).save(order);

      this.kafkaService.sendEvent('create_momo_payment', {
        orderId: savedOrder.id,
        amount: savedOrder.total_amount,
      });

      console.log('Momo Payment Created:', savedOrder.id);

      setTimeout(
        async () => {
          await this.cancelOrder(savedOrder.id);
        },
        100 * 60 * 1000,
      );

      return savedOrder;
    });

    return savedOrder;
  }

  // Cancel order
  async cancelOrder(orderId: string) {
    try {
      await this.dataSource.transaction(async (manager) => {
        const order = await manager.getRepository(Order).findOne({
          where: {
            id: orderId,
            status: OrderStatus.PENDING_PAYMENT,
          },
          relations: ['orderItems', 'orderItems.productVariant'],
        });

        if (!order) {
          return;
        }

        // check order expired
        if (order.expired_at && new Date() > order?.expired_at) {
          // Loop through order items to release stock
          for (const item of order.orderItems) {
            const stock = await manager
              .getRepository(Stock)
              .createQueryBuilder('stock')
              .setLock('pessimistic_write')
              .innerJoinAndSelect('stock.variant', 'variant')
              .andWhere('variant.id = :variantId', {
                variantId: item.productVariant.id,
              })
              .getOne();

            // Release stock (Reversed)
            if (stock) {
              stock.reserved = Math.max(0, stock.reserved - item.quantity); // item quantity in order (Not in stock)
              await manager.getRepository(Stock).save(stock);
            }
          }

          order.status = OrderStatus.CANCELED;
          order.cancelled_at = new Date();
          await manager.getRepository(Order).save(order);

          console.log(`Order ${orderId} has been canceled due to expiration.`);
        }
      });
    } catch (error) {
      console.error(`Error canceling order ${orderId}:`, error);
    }
  }

  // Cron job to cancel expired orders every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanExpriedOrders() {
    const expiredOrder = await this.orderRepository.find({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
        expired_at: LessThan(new Date()),
      },
      relations: ['orderItems', 'orderItems.productVariant'],
    });

    for (const order of expiredOrder) {
      await this.cancelOrder(order.id);
    }
  }
}
