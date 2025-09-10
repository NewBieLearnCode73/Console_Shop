import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from '../service/cart.service';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import {
  AddItemToCartRequestDto,
  RemoveItemFromCartRequestDto,
} from '../dto/request/cart-request.dto';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';

@Controller('api/carts')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  // THÊM ENDPOINTS PUT -  Thêm sản phẩm vào giỏ hàng

  // Sửa lại giỏ hàng - Sản phẩm bị inactive hoặc hết hàng
  @Get()
  @UseGuards(JwtCookieAuthGuard)
  async getCart(
    @Req() req: AuthenticationRequest,
    @Query() paginationRequestDto: PaginationRequestDto,
  ) {
    return this.cartService.getCart(req.user.id, paginationRequestDto);
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

  @Delete()
  @UseGuards(JwtCookieAuthGuard)
  async removeFromCart(
    @Req() req: AuthenticationRequest,
    @Query() removeItemFromCartRequestDto: RemoveItemFromCartRequestDto,
  ) {
    return this.cartService.removeItemFromCart(
      req.user.id,
      removeItemFromCartRequestDto.productVariantId,
      removeItemFromCartRequestDto.quantity,
    );
  }

  @Delete('clean-cart')
  @UseGuards(JwtCookieAuthGuard)
  async clearCart(@Req() req: AuthenticationRequest) {
    return this.cartService.clearCart(req.user.id);
  }
}
