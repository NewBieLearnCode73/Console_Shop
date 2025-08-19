import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/constants/role.enum';
import { isUUID } from 'class-validator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUserWithProfile(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('UUID is not accepted!');
    }
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
      select: {
        id: true,
        role: true,
        is_active: true,
        profile: {
          fullname: true,
          avatar_url: true,
        },
      },
    });
  }

  async findAllUserWithProfile() {
    return this.userRepository.find({
      relations: ['profile'],
      select: {
        id: true,
        role: true,
        is_active: true,
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

  async changeUserRoleById(userId: string, role: Role) {
    if (!isUUID(userId)) {
      throw new BadRequestException('UUID is not accepted!');
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
