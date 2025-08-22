import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { AddressService } from '../service/address.service';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import {
  CreateAddressRequestDto,
  UpdateAddressRequestDto,
} from '../dto/request/address-request.dto';

@Controller('api/addresses')
export class AddresController {
  constructor(private readonly addressService: AddressService) {}

  // GET ALL ADDRESS BASE ON JWT
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllAddress(@Request() req: AuthenticationRequest) {
    return this.addressService.getAllAdressByUserId(req.user.id);
  }

  // GET DEFAULT ADDRESS BASE ON JWT
  @Get('default')
  @UseGuards(JwtAuthGuard)
  async getDefaultAddress(@Request() req: AuthenticationRequest) {
    return this.addressService.getDefaultAddressByUserId(req.user.id);
  }

  // CREATE NEW USER ADDRESS BASE ON JWT
  @Post()
  @UseGuards(JwtAuthGuard)
  async createNewAddress(
    @Body() createAddressRequestDto: CreateAddressRequestDto,
    @Request() req: AuthenticationRequest,
  ) {
    return this.addressService.createNewUserAddress(
      req.user.id,
      createAddressRequestDto,
    );
  }

  // UPDATE USER ADDRESS BASE ON JWT
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
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
}
