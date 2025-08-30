import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from '../entity/address.entity';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Profile } from '../entity/profile.entity';
import { isUUID } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationRequestDto } from '../../../utils/pagination/pagination_dto';
import {
  CreateAddressRequestDto,
  UpdateAddressRequestDto,
} from '../dto/request/address-request.dto';
import {
  CreateAddressResponseDto,
  DefaultAddressResponseDto,
} from '../dto/response/address-response.dto';
import { PaginationResult } from 'src/utils/pagination/pagination_result';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async createNewUserAddress(
    userId: string,
    createAddressRequestDto: CreateAddressRequestDto,
  ) {
    if (!isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id ${userId}`);
    }

    const userAddress = this.addressRepository.create({
      to_name: createAddressRequestDto.to_name,
      to_phone: createAddressRequestDto.to_phone,
      to_address: createAddressRequestDto.to_address,
      to_ward_code: createAddressRequestDto.to_ward_code,
      to_district_id: createAddressRequestDto.to_district_id,
      to_province_name: createAddressRequestDto.to_province_name,
      user: user,
    });

    const newUserAddres = await this.addressRepository.save(userAddress);

    return plainToInstance(CreateAddressResponseDto, newUserAddres, {
      excludeExtraneousValues: true,
    });
  }

  async getDefaultAddressByUserId(userId: string) {
    if (!isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    const defaultAddress = await this.addressRepository.find({
      where: { is_default: true, user: { id: userId } },
      relations: ['user'],
    });

    return plainToInstance(DefaultAddressResponseDto, defaultAddress, {
      excludeExtraneousValues: true,
    });
  }

  async getAllAdressByUserId(
    userId: string,
    paginationRequestDto: PaginationRequestDto,
  ) {
    if (!isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    const page = paginationRequestDto.page ?? 1;
    const limit = paginationRequestDto.limit ?? 10;

    const [listAddress, total] = await this.addressRepository.findAndCount({
      where: { user: { id: userId } },
      take: limit,
      skip: (page - 1) * limit,
      order: { is_default: 'DESC' },
    });

    const response = listAddress.map((x) =>
      plainToInstance(DefaultAddressResponseDto, x, {
        excludeExtraneousValues: true,
      }),
    );

    return PaginationResult<DefaultAddressResponseDto>(
      response,
      total,
      page,
      limit,
    );
  }

  async setDefaultAddress(userId: string, addressId: string) {
    if (!isUUID(userId) || !isUUID(addressId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    const existAddress = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!existAddress) {
      throw new NotFoundException(`Address with id ${addressId} is not found!`);
    }

    const prevDefault = await this.addressRepository.findOne({
      where: { is_default: true, user: { id: userId } },
    });

    if (prevDefault) {
      await this.addressRepository.update(
        { id: prevDefault.id },
        { is_default: false },
      );
    }

    await this.addressRepository.update(
      { id: addressId },
      { is_default: true },
    );
  }

  async updateAddressByAddressId(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateAddressRequestDto,
  ) {
    if (!isUUID(addressId) || !isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    const existAddress = await this.addressRepository.findOne({
      where: { id: addressId },
      relations: ['user'],
    });

    if (!existAddress) {
      throw new NotFoundException(`Address with id ${addressId} is not found!`);
    }

    if (existAddress.user.id !== userId) {
      throw new BadRequestException(
        "This user can't change this address! Please try again!",
      );
    }

    this.addressRepository.merge(existAddress, updateAddressDto);
    const newAddress = await this.addressRepository.save(existAddress);

    return plainToInstance(DefaultAddressResponseDto, newAddress, {
      excludeExtraneousValues: true,
    });
  }
}
