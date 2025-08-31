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
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import {
  AddItemToCartRequestDto,
  RemoveItemFromCartRequestDto,
} from '../dto/request/cart-request.dto';

@Controller('api/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(
    @Req() req: AuthenticationRequest,
    @Query() paginationRequestDto: PaginationRequestDto,
  ) {
    return this.cartService.getCart(req.user.id, paginationRequestDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async removeFromCart(
    @Req() req: AuthenticationRequest,
    @Body() removeItemFromCartRequestDto: RemoveItemFromCartRequestDto,
  ) {
    return this.cartService.removeItemFromCart(
      req.user.id,
      removeItemFromCartRequestDto.productVariantId,
      removeItemFromCartRequestDto.quantity,
    );
  }

  @Delete('clean-cart')
  @UseGuards(JwtAuthGuard)
  async clearCart(@Req() req: AuthenticationRequest) {
    return this.cartService.clearCart(req.user.id);
  }
}
