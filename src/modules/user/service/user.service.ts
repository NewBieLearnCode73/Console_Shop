import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/constants/role.enum';
import { isUUID } from 'class-validator';
import { PaginationRequestDto } from 'src/utils/pagination/pagination_dto';
import { PaginationResult } from 'src/utils/pagination/pagination_result';
import { UserWithProfileResponseDto } from '../dto/response/user-response.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRedis() private readonly redis: Redis,
  ) { }

  async findUserWithProfile(userId: string) {
    if (!isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
      select: {
        id: true,
        role: true,
        is_active: true,
        createdAt: true,
        profile: {
          fullname: true,
          avatar_url: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} is not found!`);
    }

    return user;
  }

  async findAllUserWithProfile(paginationRequestDto: PaginationRequestDto) {
    const { page, limit, order, sortBy } = paginationRequestDto;

    const [response, total] = await this.userRepository.findAndCount({
      relations: ['profile'],
      select: {
        id: true,
        role: true,
        is_active: true,
        createdAt: true,
        profile: {
          fullname: true,
          avatar_url: true,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [sortBy]: order,
      },
    });

    return PaginationResult(response, total, page, limit);
  }

  async findAllUserIsCustomerWithProfile(
    paginationRequestDto: PaginationRequestDto,
  ) {
    const { page, limit, order, sortBy } = paginationRequestDto;

    const [response, total] = await this.userRepository.findAndCount({
      relations: ['profile'],
      select: {
        id: true,
        role: true,
        is_active: true,
        createdAt: true,
        profile: {
          fullname: true,
          avatar_url: true,
        },
      },
      where: { role: Role.CUSTOMER },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [sortBy]: order,
      },
    });

    return PaginationResult<UserWithProfileResponseDto>(
      response,
      total,
      page,
      limit,
    );
  }

  async findUserIsCustomerWithProfile(userId: string) {
    if (!isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    return await this.userRepository.findOne({
      where: { id: userId, role: Role.CUSTOMER },
      relations: ['profile'],
      select: {
        id: true,
        role: true,
        is_active: true,
        createdAt: true,
        profile: {
          fullname: true,
          avatar_url: true,
        },
      },
    });
  }

  async findUserById(userId: string): Promise<User | null> {
    if (!isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    return await this.userRepository.findOne({ where: { id: userId } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async createNewUser(email: string): Promise<User> {
    const newUser = this.userRepository.create({
      email,
      is_active: true,
    });
    await this.userRepository.save(newUser);

    return newUser;
  }

  async activeUserById(userId: string) {
    if (!isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found!`);
    }

    if (user.is_active === true) {
      throw new ConflictException(`User with id ${userId} was actived!`);
    }

    user.is_active = true;

    const updateUser = await this.userRepository.save(user);
    const { password, ...result } = updateUser;

    return result;
  }

  async activeUserIsCustomerById(userId: string) {
    if (!isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId, role: Role.CUSTOMER },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found!`);
    }

    if (user.is_active === true) {
      throw new ConflictException(`User with id ${userId} was actived!`);
    }

    user.is_active = true;

    const updateUser = await this.userRepository.save(user);
    const { password, ...result } = updateUser;

    return result;
  }

  async inactiveUserById(access_token, userId: string) {
    if (!isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    // Verify access token
    if (!access_token) {
      throw new BadRequestException('Access token is required!');
    }
    const userIdFromToken = await this.redis.get(
      `ACCESS_TOKEN:${access_token}`,
    );

    if (!userIdFromToken) {
      throw new UnauthorizedException('Invalid access token!');
    }

    if (userIdFromToken === userId) {
      throw new BadRequestException('Cannot inactive yourself!');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found!`);
    }
    if (user.is_active === false) {
      throw new ConflictException(`User with id ${userId} was inactived!`);
    }
    user.is_active = false;
    const updateUser = await this.userRepository.save(user);
    const { password, ...result } = updateUser;

    return result;
  }

  async changeUserRoleById(access_token: string, userId: string, role: Role) {
    if (!isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
    }

    // Verify access token
    if (!access_token) {
      throw new BadRequestException('Access token is required!');
    }

    const userIdFromToken = await this.redis.get(
      `ACCESS_TOKEN:${access_token}`,
    );
    if (!userIdFromToken) {
      throw new UnauthorizedException('Invalid access token!');
    }
    if (userIdFromToken === userId) {
      throw new BadRequestException('Cannot change your own role!');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found!`);
    }

    if (user.is_active === false) {
      throw new ConflictException(`User with id ${userId} was not actived!`);
    }

    if (user.role === role) {
      throw new ConflictException(
        `User with id ${userId} already had role ${role}`,
      );
    }

    user.role = role;

    const { password, ...result } = await this.userRepository.save(user);

    return result;
  }
}
