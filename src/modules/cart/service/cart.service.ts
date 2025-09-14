import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../entity/cart.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CartItem } from '../entity/cart_item.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { ProductVariant } from 'src/modules/product/entity/product_variant.entity';
import { PaginationRequestDto } from '../../../utils/pagination/pagination_dto';
import { PaginationResult } from 'src/utils/pagination/pagination_result';
import { Stock } from 'src/modules/product/entity/stock.entity';
import { Product } from 'src/modules/product/entity/product.entity';
import { ProductType } from 'src/constants/product_type.enum';
import { ProductStatus } from 'src/constants/product_status.enum';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getCart(userId: string, paginationRequestDto: PaginationRequestDto) {
    const { page, limit } = paginationRequestDto;

    const [items, total] = await this.cartItemRepository.findAndCount({
      where: { cart: { user: { id: userId } } },
      take: limit,
      skip: (page - 1) * limit,
    });

    // Lấy hình ảnh variant và tên variant
    for (const item of items) {
      const variant = await this.productVariantRepository.findOne({
        where: { id: item.product_variant_id },
        relations: ['images'],
      });
      if (variant) {
        item['name'] = variant.variant_name;
        item['imageUrl'] = variant.images.filter(
          (img) => img.is_main,
        )[0].product_url;
        item['price'] = variant.price;
        item['discount'] = variant.discount;
      }
    }

    return PaginationResult(items, total, page, limit);
  }

  async addItemToCart(
    userId: string,
    productVariantId: string,
    quantity: number,
  ) {
    const productVariant = await this.productVariantRepository.findOne({
      where: {
        id: productVariantId,
        product: { status: ProductStatus.ACTIVE },
      },
      relations: ['product'],
    });

    if (!productVariant) {
      throw new BadRequestException('Product variant not found or Inactive!');
    }

    const productOfVariant = await this.productRepository.findOne({
      where: { variants: { id: productVariantId } },
    });

    const isQuantityValid = await this.stockRepository.findOne({
      where: {
        variant: { id: productVariantId },
        quantity: MoreThanOrEqual(quantity),
      },
    });

    if (!isQuantityValid) {
      throw new BadRequestException('Invalid quantity');
    }

    if (
      productOfVariant?.product_type === ProductType.CARD_DIGITAL_KEY &&
      quantity !== 1
    ) {
      throw new BadRequestException(
        'Only 1 digital key of variant can be added to the cart!',
      );
    }

    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items'],
    });

    // Create cart
    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: userId },
        items: [],
      });

      await this.cartRepository.save(cart);
    }

    // Check item was in cart ?
    let item = cart.items.find(
      (i) => i.product_variant_id === productVariantId,
    );

    if (
      item &&
      productOfVariant?.product_type === ProductType.CARD_DIGITAL_KEY
    ) {
      throw new BadRequestException(
        'Only 1 digital key of variant can be added to the cart! Cart already has this item.',
      );
    } else if (item) {
      // Check stock
      // const isQuantityValid = await this.stockRepository.findOne({
      //   where: {
      //     variant: { id: productVariantId },
      //     quantity: MoreThanOrEqual(item.quantity + quantity),
      //   },
      // });

      // if (!isQuantityValid) {
      //   throw new BadRequestException('Please enter a valid quantity');
      // }

      // item.quantity += quantity;

      throw new BadRequestException(
        'Item already in cart, please use update cart feature to change quantity.',
      );
    } else {
      item = this.cartItemRepository.create({
        product_variant_id: productVariantId,
        cart,
        quantity,
      });
    }

    await this.cartItemRepository.save(item);
  }

  async updateItemInCart(
    userId: string,
    productVariantId: string,
    quantity: number,
  ) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items'],
    });

    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    const item = cart.items.find(
      (i) => i.product_variant_id === productVariantId,
    );

    if (!item) {
      throw new BadRequestException('Item not found in cart');
    }

    const isQuantityValid = await this.stockRepository.findOne({
      where: {
        variant: { id: productVariantId },
        quantity: MoreThanOrEqual(quantity),
      },
    });

    if (!isQuantityValid) {
      throw new BadRequestException('Please enter a valid quantity');
    }

    item.quantity = quantity;

    await this.cartItemRepository.save(item);
  }

  async removeItemFromCart(
    userId: string,
    productVariantId: string,
    quantity: number,
  ) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items'],
    });

    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    const item = cart.items.find(
      (i) => i.product_variant_id === productVariantId,
    );

    if (!item) {
      throw new BadRequestException('Item not found in cart');
    }

    item.quantity -= quantity;

    if (item.quantity <= 0) {
      await this.cartItemRepository.remove(item);
    } else {
      await this.cartItemRepository.save(item);
    }
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items'],
    });

    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    await this.cartItemRepository.remove(cart.items);
    cart.items = [];
    await this.cartRepository.save(cart);
  }
}
