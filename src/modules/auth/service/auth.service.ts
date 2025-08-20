import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { DataSource, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { JwtPayload } from 'src/interfaces/payload';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User not found! Please check your email and password.',
      );
    }

    if (!user.is_active) {
      throw new UnauthorizedException(
        'User account is not activated. Please activate your account first.',
      );
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Your account may have been registered using a social network, please select the appropriate login method!',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid password! Please check your email and password.',
      );
    }

    return user;
  }

  login(user: User) {
    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '14d' }),
    };
  }

  async register(registerDto: RegisterDto) {
    const userExists = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (userExists) {
      throw new ConflictException('Email already exists!');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);

    const newUser = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);
  }
}
