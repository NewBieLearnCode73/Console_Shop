import { BadRequestException, Injectable } from '@nestjs/common';
import {
  OrderDigitalBuyNowRequestDto,
  OrderPhysicalBuyNowRequestDto,
} from '../dto/request/order-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, In } from 'typeorm';
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
import { ProductStatus } from 'src/constants/product_status.enum';
import { PaymentMethod } from 'src/constants/payment_method.enum';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';
import { PaginationResult } from 'src/utils/pagination/pagination_result';
import { OrderShippingResponseDto } from '../dto/response/order-response.dto';
import { GhnService } from 'src/modules/giaohangnhanh/service/ghn.service';
import { PaymentStatus } from 'src/constants/payment_status.enum';
import { OrderCheckoutCartRequestDto } from '../dto/request/order-request.dto';

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
    private readonly ghnService: GhnService,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  // Get digital keys for an order
  async getDigitalKeys(
    userId: string,
    orderId: string,
    product_variant_id: string,
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: [
        'orderItems',
        'orderItems.digitalKey',
        'orderItems.productVariant',
      ],
    });
    if (!order)
      throw new BadRequestException('Order not found! Or not your order');
    if (order.order_type !== OrderType.DIGITAL)
      throw new BadRequestException('Not a digital product order!');
    if (order.status !== OrderStatus.COMPLETED)
      throw new BadRequestException('Order is not paid!');

    // Return only items with digital keys
    const digital_key = order.orderItems
      .filter(
        (item) =>
          item.digitalKey && item.productVariant.id === product_variant_id,
      )
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
      where: {
        id: productVariantId,
        product: { status: ProductStatus.ACTIVE },
      },
      relations: ['product'],
    });

    if (!productVariant)
      throw new BadRequestException('Product variant not found or inactive!');

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

      // Lock
      const availableKey = await manager
        .getRepository(DigitalKey)
        .createQueryBuilder('digitalKey')
        .setLock('pessimistic_write')
        .innerJoinAndSelect('digitalKey.variant', 'variant')
        .andWhere('variant.id = :variantId', { variantId: productVariant.id })
        .andWhere('digitalKey.status = :status', { status: KeyStatus.UNUSED })
        .andWhere('digitalKey.orderItem IS NULL')
        .getOne();

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
        status: OrderStatus.PENDING_PAYMENT,
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

      return savedOrder;
    });

    return savedOrder;
  }

  // Checkout cart
  // Checkout cart (Digital products)
  async checkOutCartDigitalProduct(
    userId: string,
    orderCheckoutRequestDto: OrderCheckoutCartRequestDto[],
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found!');

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      let sub_total = 0;
      const orderItems: OrderItem[] = [];

      for (const item of orderCheckoutRequestDto) {
        const { productVariantId } = item;

        const productVariant = await this.productVariantRepository.findOne({
          where: {
            id: productVariantId,
            product: { status: ProductStatus.ACTIVE },
          },
          relations: ['product'],
        });

        if (
          !productVariant ||
          productVariant.product.product_type !== ProductType.CARD_DIGITAL_KEY
        ) {
          throw new BadRequestException(
            'Product variant not found or invalid digital product!',
          );
        }

        // Stock lock
        const stock = await manager
          .getRepository(Stock)
          .createQueryBuilder('stock')
          .setLock('pessimistic_write')
          .innerJoinAndSelect('stock.variant', 'variant')
          .andWhere('variant.id = :variantId', { variantId: productVariantId })
          .getOne();

        if (!stock)
          throw new BadRequestException(
            `Stock information not found for product variant ${productVariantId}!`,
          );

        const available = stock.quantity - stock.reserved;
        if (available <= 0)
          throw new BadRequestException(
            `Insufficient stock for product variant ${productVariantId}!`,
          );

        stock.reserved += 1;
        await manager.getRepository(Stock).save(stock);

        // Digital key lock
        const availableKey = await manager
          .getRepository(DigitalKey)
          .createQueryBuilder('digitalKey')
          .setLock('pessimistic_write')
          .innerJoinAndSelect('digitalKey.variant', 'variant')
          .andWhere('variant.id = :variantId', { variantId: productVariant.id })
          .andWhere('digitalKey.status = :status', { status: KeyStatus.UNUSED })
          .andWhere('digitalKey.orderItem IS NULL')
          .getOne();

        if (!availableKey)
          throw new BadRequestException(
            `No available digital keys for product variant ${productVariant.id} in stock!`,
          );

        const orderItem = await manager.getRepository(OrderItem).save({
          quantity: 1,
          price: productVariant.price,
          productVariant,
          digitalKey: availableKey,
        });

        orderItems.push(orderItem);
        sub_total += orderItem.price * orderItem.quantity;
      }

      // Order info
      const expiredAt = new Date();
      expiredAt.setMinutes(expiredAt.getMinutes() + 100);

      const order = manager.getRepository(Order).create({
        status: OrderStatus.PENDING_PAYMENT,
        sub_total,
        shipping_fee: 0,
        total_amount: sub_total,
        order_type: OrderType.DIGITAL,
        orderItems,
        user,
        expired_at: expiredAt,
      });

      const savedOrder = await manager.getRepository(Order).save(order);

      // Send payment event (MoMo)
      this.kafkaService.sendEvent('create_momo_payment', {
        orderId: savedOrder.id,
        amount: savedOrder.total_amount,
      });

      console.log('Momo Payment Created for Cart:', savedOrder.id);

      return savedOrder;
    });

    return savedOrder;
  }

  // Cancel order
  async autoFailedOrder(orderId: string) {
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

          order.status = OrderStatus.FAILED;
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
  @Cron(CronExpression.EVERY_10_SECONDS)
  async cleanExpriedOrders() {
    const expiredOrder = await this.orderRepository.find({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
        expired_at: LessThan(new Date()),
      },
      relations: ['orderItems', 'orderItems.productVariant'],
    });

    for (const order of expiredOrder) {
      await this.autoFailedOrder(order.id);
    }
  }

  async physicalProductBuyNow(
    userId: string,
    orderPhysicalBuyNowRequestDto: OrderPhysicalBuyNowRequestDto,
  ) {
    const { productVariantId, quantity, addressId, paymentMethod } =
      orderPhysicalBuyNowRequestDto;

    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });
    if (!user) throw new BadRequestException('User not found or inactive!');

    const productVariant = await this.productVariantRepository.findOne({
      where: {
        id: productVariantId,
        product: { status: ProductStatus.ACTIVE },
      },
      relations: ['product'],
    });

    if (!productVariant)
      throw new BadRequestException('Product variant not found or inactive!');

    if (productVariant.product.product_type === ProductType.CARD_DIGITAL_KEY)
      throw new BadRequestException('Invalid product type for physical order!');

    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) throw new BadRequestException('Address not found!');

    // Thanh toán COD
    let savedOrder;

    // ********************************** THANH TOÁN COD *******************************
    if (paymentMethod === PaymentMethod.COD) {
      savedOrder = await this.dataSource.transaction(async (manager) => {
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
        if (available < quantity)
          throw new BadRequestException(
            'Insufficient stock for product variant!',
          );

        stock.reserved += quantity;
        await manager.getRepository(Stock).save(stock);

        const orderItem = manager.getRepository(OrderItem).create({
          quantity,
          price: productVariant.price,
          productVariant,
        });

        const discount = productVariant.discount / 100;
        const discount_amount = orderItem.price * orderItem.quantity * discount;
        const sub_total = orderItem.price * orderItem.quantity;

        const shipping_fee = await this.ghnService.calculateShippingFee(
          address.to_district_id,
          address.to_ward_code,
          2,
          0,
          productVariant.product.weight * orderItem.quantity,
          0,
          0,
          orderItem.price * orderItem.quantity,
        );

        const orderProp = {
          status: OrderStatus.PENDING_CONFIRMATION,
          sub_total,
          discount_amount: discount_amount,
          order_type: OrderType.PHYSICAL,
          orderItems: [orderItem],
          total_amount: sub_total - discount_amount + shipping_fee.service_fee,
        };

        const orderAddress = manager.getRepository(OrderAddress).create({
          to_address: address.to_address,
          to_district_id: address.to_district_id,
          to_name: address.to_name,
          to_phone: address.to_phone,
          to_province_name: address.to_province_name,
          to_ward_code: address.to_ward_code,
        });

        const savedOrderAddress = await manager
          .getRepository(OrderAddress)
          .save(orderAddress);

        const order = manager.getRepository(Order).create({
          status: orderProp.status,
          sub_total: orderProp.sub_total,
          discount_amount: orderProp.discount_amount,
          order_type: orderProp.order_type,
          orderItems: orderProp.orderItems,
          total_amount: orderProp.total_amount,
          orderAddress: savedOrderAddress,
          shipping_fee: shipping_fee.service_fee,
          user,
        });

        const result = await manager.getRepository(Order).save(order);
        return result;
      });
    }

    // ********************************** THANH TOÁN MOMO *******************************
    else if (paymentMethod === PaymentMethod.MOMO_WALLET) {
      savedOrder = await this.dataSource.transaction(async (manager) => {
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
        if (available < quantity)
          throw new BadRequestException(
            'Insufficient stock for product variant!',
          );

        stock.reserved += quantity;
        await manager.getRepository(Stock).save(stock);

        const orderItem = await manager.getRepository(OrderItem).create({
          quantity,
          price: productVariant.price,
          productVariant,
        });

        const discount = productVariant.discount / 100;
        const discount_amount = orderItem.price * orderItem.quantity * discount;
        const sub_total = orderItem.price * orderItem.quantity;

        const expiredAt = new Date();
        expiredAt.setMinutes(expiredAt.getMinutes() + 100);

        const shipping_fee = await this.ghnService.calculateShippingFee(
          address.to_district_id,
          address.to_ward_code,
          2,
          0,
          productVariant.product.weight * orderItem.quantity,
          0,
          0,
          orderItem.price * orderItem.quantity,
        );

        const orderProp = {
          status: OrderStatus.PENDING_PAYMENT,
          sub_total,
          discount_amount: discount_amount,
          order_type: OrderType.PHYSICAL,
          orderItems: [orderItem],
          total_amount: sub_total - discount_amount + shipping_fee.service_fee,
          declareation_fee: 0,
          expired_at: expiredAt,
        };

        const orderAddress = manager.getRepository(OrderAddress).create({
          to_address: address.to_address,
          to_district_id: address.to_district_id,
          to_name: address.to_name,
          to_phone: address.to_phone,
          to_province_name: address.to_province_name,
          to_ward_code: address.to_ward_code,
        });

        const savedOrderAddress = await manager
          .getRepository(OrderAddress)
          .save(orderAddress);

        const order = manager.getRepository(Order).create({
          status: orderProp.status,
          sub_total: orderProp.sub_total,
          discount_amount: orderProp.discount_amount,
          order_type: orderProp.order_type,
          orderItems: orderProp.orderItems,
          total_amount: orderProp.total_amount,
          shipping_fee: shipping_fee.service_fee,
          orderAddress: savedOrderAddress,
          user,
          expired_at: orderProp.expired_at,
        });

        const result = await manager.getRepository(Order).save(order);

        this.kafkaService.sendEvent('create_momo_payment', {
          orderId: result.id,
          amount: result.total_amount,
        });
      });
    } else {
      throw new BadRequestException('Invalid payment method!');
    }

    return savedOrder;
  }

  async checkoutCartPhysicalProduct(
    userId: string,
    addressId: string,
    paymentMethod: PaymentMethod,
    orderCheckoutCartRequestDto: OrderCheckoutCartRequestDto[],
  ) {
    // Không check user, address , payment method vì đã check ở bước trước

    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) throw new BadRequestException('Address not found!');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found!');

    let sub_total = 0;
    let discount_amount = 0;
    let total_weight = 0;
    const order_items: OrderItem[] = [];
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      // ********************************** THANH TOÁN COD *******************************
      if (paymentMethod === PaymentMethod.COD) {
        for (const item of orderCheckoutCartRequestDto) {
          const { productVariantId, quantity } = item;

          const productVariant = await this.productVariantRepository.findOne({
            where: {
              id: productVariantId,
              product: { status: ProductStatus.ACTIVE },
            },
            relations: ['product'],
          });

          if (!productVariant)
            throw new BadRequestException('Product variant not found!');

          const stock = await manager
            .getRepository(Stock)
            .createQueryBuilder('stock')
            .setLock('pessimistic_write')
            .innerJoinAndSelect('stock.variant', 'variant')
            .andWhere('variant.id = :variantId', {
              variantId: productVariantId,
            })
            .getOne();

          if (!stock)
            throw new BadRequestException(
              'Stock information not found for product variant!',
            );

          const available = stock.quantity - stock.reserved;

          if (available < quantity)
            throw new BadRequestException(
              'Insufficient stock for product variant!',
            );
          stock.reserved += quantity;
          await manager.getRepository(Stock).save(stock);

          const orderItem = manager.getRepository(OrderItem).create({
            quantity,
            price: productVariant.price,
            productVariant,
          });

          order_items.push(orderItem);

          const discount = productVariant.discount / 100;
          discount_amount += orderItem.price * orderItem.quantity * discount;
          sub_total += orderItem.price * orderItem.quantity;
          total_weight += productVariant.product.weight * orderItem.quantity;
        }

        const shipping_fee = await this.ghnService.calculateShippingFee(
          address.to_district_id,
          address.to_ward_code,
          2,
          0,
          total_weight,
          0,
          0,
          sub_total,
        );

        const orderProp = {
          status: OrderStatus.PENDING_CONFIRMATION,
          sub_total,
          discount_amount: Number(discount_amount),
          order_type: OrderType.PHYSICAL,
          orderItems: order_items,
          total_amount: sub_total - discount_amount + shipping_fee.service_fee,
        };

        const orderAddress = manager.getRepository(OrderAddress).create({
          to_address: address.to_address,
          to_district_id: address.to_district_id,
          to_name: address.to_name,
          to_phone: address.to_phone,
          to_province_name: address.to_province_name,
          to_ward_code: address.to_ward_code,
        });

        const savedOrderAddress = await manager
          .getRepository(OrderAddress)
          .save(orderAddress);

        const order = manager.getRepository(Order).create({
          status: orderProp.status,
          sub_total: orderProp.sub_total,
          discount_amount: orderProp.discount_amount,
          order_type: orderProp.order_type,
          orderItems: orderProp.orderItems,
          total_amount: orderProp.total_amount,
          orderAddress: savedOrderAddress,
          shipping_fee: shipping_fee.service_fee,
          user,
        });

        const result = await manager.getRepository(Order).save(order);
        return result;
      }

      // ********************************** THANH TOÁN MOMO *******************************
      if (paymentMethod === PaymentMethod.MOMO_WALLET) {
        for (const item of orderCheckoutCartRequestDto) {
          const { productVariantId, quantity } = item;

          const productVariant = await this.productVariantRepository.findOne({
            where: {
              id: productVariantId,
              product: { status: ProductStatus.ACTIVE },
            },
            relations: ['product'],
          });

          if (!productVariant)
            throw new BadRequestException('Product variant not found!');

          const stock = await manager
            .getRepository(Stock)
            .createQueryBuilder('stock')
            .setLock('pessimistic_write')
            .innerJoinAndSelect('stock.variant', 'variant')
            .andWhere('variant.id = :variantId', {
              variantId: productVariantId,
            })
            .getOne();

          if (!stock)
            throw new BadRequestException(
              'Stock information not found for product variant!',
            );

          const available = stock.quantity - stock.reserved;
          if (available < quantity)
            throw new BadRequestException(
              'Insufficient stock for product variant!',
            );

          stock.reserved += quantity;
          await manager.getRepository(Stock).save(stock);

          const orderItem = await manager.getRepository(OrderItem).create({
            quantity,
            price: productVariant.price,
            productVariant,
          });

          order_items.push(orderItem);

          const discount = productVariant.discount / 100;
          discount_amount += orderItem.price * orderItem.quantity * discount;
          sub_total += orderItem.price * orderItem.quantity;
          total_weight += productVariant.product.weight * orderItem.quantity;
        }

        const shipping_fee = await this.ghnService.calculateShippingFee(
          address.to_district_id,
          address.to_ward_code,
          2,
          0,
          total_weight,
          0,
          0,
          sub_total,
        );

        const expiredAt = new Date();
        expiredAt.setMinutes(expiredAt.getMinutes() + 100);

        const orderProp = {
          status: OrderStatus.PENDING_PAYMENT,
          sub_total,
          discount_amount: Number(discount_amount),
          order_type: OrderType.PHYSICAL,
          orderIteams: order_items,
          total_amount: sub_total - discount_amount + shipping_fee.service_fee,
          declareation_fee: 0,
          expired_at: expiredAt,
        };

        const orderAddress = manager.getRepository(OrderAddress).create({
          to_address: address.to_address,
          to_district_id: address.to_district_id,
          to_name: address.to_name,
          to_phone: address.to_phone,
          to_province_name: address.to_province_name,
          to_ward_code: address.to_ward_code,
        });

        const savedOrderAddress = await manager
          .getRepository(OrderAddress)
          .save(orderAddress);

        const order = manager.getRepository(Order).create({
          status: orderProp.status,
          sub_total: orderProp.sub_total,
          discount_amount: orderProp.discount_amount,
          order_type: orderProp.order_type,
          orderItems: orderProp.orderIteams,
          total_amount: orderProp.total_amount,
          shipping_fee: shipping_fee.service_fee,
          orderAddress: savedOrderAddress,
          user,
          expired_at: orderProp.expired_at,
        });

        const result = await manager.getRepository(Order).save(order);

        console.log('Momo Payment Created:', result.id);

        this.kafkaService.sendEvent('create_momo_payment', {
          orderId: result.id,
          amount: result.total_amount,
        });

        return result;
      }
    });

    return savedOrder;
  }

  async getOrderByIdForUser(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['orderItems', 'orderItems.productVariant', 'orderAddress'],
    });

    if (!order)
      throw new BadRequestException('Order not found or not your order!');

    return order;
  }

  async changeOrderAddress(userId: string, orderId: string, addressId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        user: { id: userId },
        order_type: OrderType.PHYSICAL,
      },
      relations: ['orderAddress', 'user'],
    });

    if (!order)
      throw new BadRequestException('Order not found or not your order!');

    if (
      !(
        order.status === OrderStatus.PENDING_CONFIRMATION || //
        order.status === OrderStatus.PENDING_PAYMENT ||
        order.status === OrderStatus.PAID
      )
    ) {
      throw new BadRequestException(
        'You can only change address when order is in PENDING_CONFIRMATION, PENDING_PAYMENT or PAID status.',
      );
    }

    console.log('Order found:', order);

    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) throw new BadRequestException('Address not found!');

    console.log('Address found:', address);

    order.orderAddress.to_name = address.to_name;
    order.orderAddress.to_phone = address.to_phone;
    order.orderAddress.to_address = address.to_address;
    order.orderAddress.to_ward_code = address.to_ward_code;
    order.orderAddress.to_district_id = address.to_district_id;
    order.orderAddress.to_province_name = address.to_province_name;
    order.orderAddress.updatedAt = new Date();

    await this.orderAddressRepository.update(
      order.orderAddress.id,
      order.orderAddress,
    );
    const result = await this.orderRepository.save(order);

    return result;
  }

  async cancelOrderByUser(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        user: { id: userId },
        order_type: OrderType.PHYSICAL,
      },
      relations: ['orderItems', 'orderItems.productVariant'],
    });
    if (!order)
      throw new BadRequestException('Order not found or not your order!');

    if (
      !(
        order.status === OrderStatus.PENDING_CONFIRMATION ||
        order.status === OrderStatus.PENDING_PAYMENT
      )
    ) {
      throw new BadRequestException(
        'You can only cancel orders in PENDING_CONFIRMATION or PENDING_PAYMENT status.',
      );
    }

    try {
      await this.dataSource.transaction(async (manager) => {
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
          if (stock) {
            stock.reserved = Math.max(0, stock.reserved - item.quantity);
            await manager.getRepository(Stock).save(stock);
          }
        }

        order.status = OrderStatus.CANCELED;
        order.cancelled_at = new Date();

        await manager.getRepository(Order).save(order);

        console.log(`Order ${orderId} has been canceled by user.`);
      });
    } catch (error) {
      console.error(`Error canceling order ${orderId}:`, error);
    }
  }

  async getAllOrders(paginationRequestDto: PaginationRequestDto) {
    const { page, limit, order, sortBy } = paginationRequestDto;

    const [result, total] = await this.orderRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      order: { [sortBy]: order },
    });

    return PaginationResult(result, total, page, limit);
  }

  async getOrdersByStatus(
    status: OrderStatus,
    paginationRequestDto: PaginationRequestDto,
  ) {
    const { page, limit, order, sortBy } = paginationRequestDto;

    const [result, total] = await this.orderRepository.findAndCount({
      where: { status },
      take: limit,
      skip: (page - 1) * limit,
      order: { [sortBy]: order },
    });

    return PaginationResult(result, total, page, limit);
  }

  async getOrderById(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'orderItems.productVariant', 'orderAddress'],
    });
    if (!order) throw new BadRequestException('Order not found!');
    return order;
  }

  async confrimOrder(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        status: In([OrderStatus.PENDING_CONFIRMATION, OrderStatus.PAID]),
        order_type: OrderType.PHYSICAL,
      },
      relations: ['orderItems', 'orderItems.productVariant'],
    });

    console.log('Order to confirm:', order);

    if (!order)
      throw new BadRequestException(
        'Order not found or not in PENDING_CONFIRMATION/PAID status!',
      );

    order.status = OrderStatus.CONFIRMED;
    await this.orderRepository.save(order);
    return order;
  }

  async shipOrder(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        status: OrderStatus.CONFIRMED,
        order_type: OrderType.PHYSICAL,
      },
      relations: [
        'orderAddress',
        'orderItems',
        'orderItems.productVariant',
        'orderItems.productVariant.product',
      ],
    });

    if (!order)
      throw new BadRequestException(
        'Order not found or not in CONFIRMED status!',
      );

    console.log('Order to ship:', order);

    // Trả về đơn hàng

    const responseOrder: OrderShippingResponseDto = {
      orderId: order.id,
      to_name: order.orderAddress.to_name,
      to_phone: order.orderAddress.to_phone,
      to_address: order.orderAddress.to_address,
      to_ward_code: order.orderAddress.to_ward_code,
      to_district_id: order.orderAddress.to_district_id,
      cod_amount: order.total_amount,
      items: order.orderItems.map((item) => {
        return {
          name: item.productVariant.variant_name,
          code: item.productVariant.sku,
          quantity: item.quantity,
          weight: item.productVariant.product.weight,
        };
      }),
    };

    for (const item of order.orderItems) {
      const stock = await this.stockRepository.findOne({
        where: { variant: { id: item.productVariant.id } },
      });

      if (!stock) throw new BadRequestException('Stock information not found!');

      console.log('Stock before shipping:', stock);

      if (stock) {
        stock.reserved = Math.max(0, stock.reserved - item.quantity);
        stock.quantity = Math.max(0, stock.quantity - item.quantity);
      }

      console.log('Stock after shipping:', stock);

      await this.stockRepository.save(stock);
    }

    const result = await this.ghnService.createOrder({
      order_id: responseOrder.orderId,
      to_name: responseOrder.to_name,
      to_phone: responseOrder.to_phone,
      to_address: responseOrder.to_address,
      to_ward_code: responseOrder.to_ward_code,
      to_district_id: responseOrder.to_district_id,
      cod_amount: Number(order.total_amount),
      length: 0,
      width: 0,
      height: 0,
      items: responseOrder.items,
    });

    order.status = OrderStatus.SHIPPED;
    order.order_code = result.order_code;
    await this.orderRepository.save(order);

    // Tạo payment record
    this.kafkaService.sendEvent('create_payment_record', {
      orderId: order.id,
      amount: Number(order.total_amount),
      method: PaymentMethod.COD,
      status: PaymentStatus.PENDING,
      trans_id: null,
      paid_at: null,
    });

    return result;
  }

  async cancelOrder(orderId: string) {}

  async deliverdOrder(orderId: string) {}

  async returnOrder(orderId: string) {}
}
