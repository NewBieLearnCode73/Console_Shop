import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from '../service/address.service';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import {
  CreateAddressRequestDto,
  setDefaultAddressRequestDto,
  UpdateAddressRequestDto,
} from '../dto/request/address-request.dto';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';
import { JwtCookieAuthGuard } from 'src/guards/jwt_cookie.guard';

@Controller('api/addresses')
export class AddresController {
  constructor(private readonly addressService: AddressService) {}

  // GET ALL
  @Get()
  @UseGuards(JwtCookieAuthGuard)
  async getAllAddress(
    @Request() req: AuthenticationRequest,
    @Query() paginationRequestDto: PaginationRequestDto,
  ) {
    return this.addressService.getAllAdressByUserId(
      req.user.id,
      paginationRequestDto,
    );
  }

  // GET DEFAULT
  @Get('default')
  @UseGuards(JwtCookieAuthGuard)
  async getDefaultAddress(@Request() req: AuthenticationRequest) {
    return this.addressService.getDefaultAddressByUserId(req.user.id);
  }

  // CREATE NEW ADRESS
  @Post()
  @UseGuards(JwtCookieAuthGuard)
  async createNewAddress(
    @Body() createAddressRequestDto: CreateAddressRequestDto,
    @Request() req: AuthenticationRequest,
  ) {
    return this.addressService.createNewUserAddress(
      req.user.id,
      createAddressRequestDto,
    );
  }

  // UPDATE USER ADDRESS
  @Patch('update/:id')
  @UseGuards(JwtCookieAuthGuard)
  async updateUserAddress(
    @Request() req: AuthenticationRequest,
    @Param('id') addressId: string,
    @Body() updateAddressDto: UpdateAddressRequestDto,
  ) {
    return this.addressService.updateAddressByAddressId(
      req.user.id,
      addressId,
      updateAddressDto,
    );
  }

  // SET DEFAULT ADDRESS
  @Patch('set-default')
  @UseGuards(JwtCookieAuthGuard)
  async setDefaultAddress(
    @Request() req: AuthenticationRequest,
    @Body() setDefaultAddressRequestDto: setDefaultAddressRequestDto,
  ) {
    return this.addressService.setDefaultAddress(
      req.user.id,
      setDefaultAddressRequestDto.addressId,
    );
  }

  // DELETE ADDRESS
  @Delete('delete/:id')
  @UseGuards(JwtCookieAuthGuard)
  async deleteAddress(
    @Request() req: AuthenticationRequest,
    @Param('id') addressId: string,
  ) {
    return this.addressService.deleteAddressByAddressId(req.user.id, addressId);
  }
}
