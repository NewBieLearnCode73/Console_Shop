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
import { encryptProfile, decryptProfile } from '../../../utils/crypto_helper';

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

  private encryptSensitiveFields(address: any) {
    return {
      ...address,
      to_name: encryptProfile(address.to_name),
      to_phone: encryptProfile(address.to_phone),
      to_address: encryptProfile(address.to_address),
    };
  }

  private decryptSensitiveFields(address: any) {
    if (!address) return address;
    return {
      ...address,
      to_name: decryptProfile(address.to_name),
      to_phone: decryptProfile(address.to_phone),
      to_address: decryptProfile(address.to_address),
    };
  }

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

    // Encrypt sensitive data before saving
    const encryptedAddressData = this.encryptSensitiveFields({
      to_name: createAddressRequestDto.to_name,
      to_phone: createAddressRequestDto.to_phone,
      to_address: createAddressRequestDto.to_address,
    });

    const userAddress = this.addressRepository.create({
      to_name: encryptedAddressData.to_name,
      to_phone: encryptedAddressData.to_phone,
      to_address: encryptedAddressData.to_address,
      to_ward_code: createAddressRequestDto.to_ward_code,
      to_district_id: createAddressRequestDto.to_district_id,
      to_province_name: createAddressRequestDto.to_province_name,
      user: user,
    });

    const newUserAddres = await this.addressRepository.save(userAddress);

    // Decrypt sensitive data before returning
    const decryptedAddress = this.decryptSensitiveFields(newUserAddres);

    return plainToInstance(CreateAddressResponseDto, decryptedAddress, {
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

    // Decrypt sensitive data before returning
    const decryptedAddresses = defaultAddress.map((address) =>
      this.decryptSensitiveFields(address),
    );

    return plainToInstance(DefaultAddressResponseDto, decryptedAddresses, {
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

    const { page, limit, order, sortBy } = paginationRequestDto;

    const [listAddress, total] = await this.addressRepository.findAndCount({
      where: { user: { id: userId } },
      take: limit,
      skip: (page - 1) * limit,
      order: {
        [sortBy]: order,
      },
    });

    // Decrypt sensitive data before returning
    const decryptedAddresses = listAddress.map((address) =>
      this.decryptSensitiveFields(address),
    );

    const response = decryptedAddresses.map((x) =>
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

    // Encrypt sensitive data before updating
    const encryptedUpdateData = { ...updateAddressDto };
    if (updateAddressDto.to_name) {
      encryptedUpdateData.to_name = decryptProfile(updateAddressDto.to_name);
    }
    if (updateAddressDto.to_phone) {
      encryptedUpdateData.to_phone = decryptProfile(updateAddressDto.to_phone);
    }
    if (updateAddressDto.to_address) {
      encryptedUpdateData.to_address = decryptProfile(
        updateAddressDto.to_address,
      );
    }

    this.addressRepository.merge(existAddress, encryptedUpdateData);
    const newAddress = await this.addressRepository.save(existAddress);

    // Decrypt sensitive data before returning
    const decryptedAddress = this.decryptSensitiveFields(newAddress);

    return plainToInstance(DefaultAddressResponseDto, decryptedAddress, {
      excludeExtraneousValues: true,
    });
  }

  async deleteAddressByAddressId(userId: string, addressId: string) {
    if (!isUUID(addressId) || !isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    const addresses = await this.addressRepository.find({
      where: { user: { id: userId } },
    });

    if (addresses.length === 0) {
      throw new NotFoundException(`User with id ${userId} has no address!`);
    }

    if (addresses.length === 1) {
      throw new BadRequestException(
        'You only have one address, you cannot delete it!',
      );
    }

    const addressToDelete = addresses.find((addr) => addr.id === addressId);

    if (!addressToDelete) {
      throw new NotFoundException(`Address with id ${addressId} is not found!`);
    }

    await this.addressRepository.remove(addressToDelete);
  }
}
