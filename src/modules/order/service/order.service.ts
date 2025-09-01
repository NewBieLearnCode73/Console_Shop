import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderDigitalBuyNowRequestDto } from '../dto/request/order-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../entity/order.entity';
import { OrderItem } from '../entity/order_item.entity';
import { OrderAddress } from '../entity/order_address.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { ProductVariant } from 'src/modules/product/entity/product_variant.entity';
import { Address } from 'src/modules/user/entity/address.entity';
import { Stock } from 'src/modules/product/entity/stock.entity';
import { ProductType } from 'src/constants/product_type.enum';
import { OrderType } from 'src/constants/order_type.enum';

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
    private readonly dataSource: DataSource,
  ) {}

  async digitalProductBuyNow(
    userId: string,
    orderDigitalBuyNowRequestDto: OrderDigitalBuyNowRequestDto,
  ) {
    const { productVariantId } = orderDigitalBuyNowRequestDto;
    const productVariant = await this.productVariantRepository.findOne({
      where: { id: productVariantId },
      relations: ['product'],
    });

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found!');
    }

    if (
      !productVariant ||
      productVariant.product.product_type !== ProductType.CARD_DIGITAL_KEY
    ) {
      throw new BadRequestException(
        'Product variant not found or invalid digital product!',
      );
    }

    // Proceed with the order creation logic
    await this.dataSource.transaction(async (manager) => {
      const stock = await manager
        .getRepository(Stock)
        .createQueryBuilder('stock')
        .setLock('pessimistic_write') // Lock stock
        .innerJoinAndSelect('stock.variant', 'variant')
        .andWhere('variant.id = :variantId', { variantId: productVariantId })
        .getOne();

      if (!stock) {
        throw new BadRequestException(
          'Stock information not found for product variant!',
        );
      }

      // Check available
      const available = stock.quantity - stock.reserved;
      if (available <= 0) {
        throw new BadRequestException(
          'Insufficient stock for product variant!',
        );
      }

      stock.reserved += 1;
      await manager.getRepository(Stock).save(stock);

      // Tạo order
      const orderItem = await this.orderItemRepository.save({
        quantity: 1,
        price: productVariant.price,
        productVariant,
      });

      const sub_total = orderItem.price * orderItem.quantity;

      const order = this.orderRepository.create({
        sub_total,
        shipping_fee: 0,
        total_amount: sub_total,
        order_type: OrderType.DIGITAL,
        orderItems: [orderItem],
        user,
      });

      const savedOrder = await this.orderRepository.save(order);

      // Public sự kiện order.created vào Kafka để tạo
    });
  }
}
