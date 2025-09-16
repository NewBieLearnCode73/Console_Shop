import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from '../service/cart.service';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import {
  AddItemToCartRequestDto,
  CartTypeRequestDto,
  CheckOutAddressRequestDto,
  RemoveItemFromCartRequestDto,
  RemoveMultipleItemsFromCartRequestDto,
} from '../dto/request/cart-request.dto';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';

@Controller('api/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Sửa lại giỏ hàng - Sản phẩm bị inactive hoặc hết hàng
  @Get()
  @UseGuards(JwtCookieAuthGuard)
  async getCart(
    @Req() req: AuthenticationRequest,
    @Query() paginationRequestDto: PaginationRequestDto,
    @Query() cartTypeRequestDto: CartTypeRequestDto,
  ) {
    return this.cartService.getCart(
      req.user.id,
      paginationRequestDto,
      cartTypeRequestDto.cartType,
    );
  }

  @Get('checkout-physical')
  @UseGuards(JwtCookieAuthGuard)
  async getCartForCheckoutPhysical(
    @Req() req: AuthenticationRequest,
    @Body() checkOutAddressRequestDto: CheckOutAddressRequestDto,
  ) {
    return this.cartService.checkoutPhysicalProductsInCart(
      req.user.id,
      checkOutAddressRequestDto.addressId,
      checkOutAddressRequestDto.paymentMethod,
    );
  }

  @Get('checkout-digital')
  @UseGuards(JwtCookieAuthGuard)
  async getCartForCheckoutDigital(@Req() req: AuthenticationRequest) {
    return this.cartService.checkoutDigitalProductsInCart(req.user.id);
  }

  // SỬA LẠI SẢN PHẨM TRONG GIỎ HÀNG - SẢN PHẨM BỊ INACTIVE HOẶC HẾT HÀNG
  @Post()
  @UseGuards(JwtCookieAuthGuard)
  async addToCart(
    @Req() req: AuthenticationRequest,
    @Body() addItemToCartRequestDto: AddItemToCartRequestDto,
  ) {
    return this.cartService.addItemToCart(
      req.user.id,
      addItemToCartRequestDto.productVariantId,
      addItemToCartRequestDto.quantity,
    );
  }

  @Put()
  @UseGuards(JwtCookieAuthGuard)
  async updateCartItem(
    @Req() req: AuthenticationRequest,
    @Body() addItemToCartRequestDto: AddItemToCartRequestDto,
  ) {
    return this.cartService.updateItemInCart(
      req.user.id,
      addItemToCartRequestDto.productVariantId,
      addItemToCartRequestDto.quantity,
    );
  }

  @Delete()
  @UseGuards(JwtCookieAuthGuard)
  async removeFromCart(
    @Req() req: AuthenticationRequest,
    @Query() removeItemFromCartRequestDto: RemoveItemFromCartRequestDto,
  ) {
    return this.cartService.removeItemFromCart(
      req.user.id,
      removeItemFromCartRequestDto.productVariantId,
    );
  }

  @Patch('remove-multiple')
  @UseGuards(JwtCookieAuthGuard)
  async removeMultipleFromCart(
    @Req() req: AuthenticationRequest,
    @Body() removeItemFromCartRequestDto: RemoveMultipleItemsFromCartRequestDto,
  ) {
    return this.cartService.removeMultipleItemsFromCart(
      req.user.id,
      removeItemFromCartRequestDto.productVariantIds,
    );
  }

  @Delete('clean-cart')
  @UseGuards(JwtCookieAuthGuard)
  async clearCart(@Req() req: AuthenticationRequest) {
    return this.cartService.clearCart(req.user.id);
  }
}
