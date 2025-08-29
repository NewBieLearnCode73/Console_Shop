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
import {
  ActiveAccountRequestDto,
  registerRequestDto,
} from '../dto/request/auth-request.dto';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import {
  sendMailResetPassword,
  sendMailActiveAccount,
} from 'src/utils/brevo_helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    @InjectRedis()
    private readonly redis: Redis,
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

  // REGISTER ACCOUNT
  async register(registerRequestDto: registerRequestDto) {
    const userExists = await this.userRepository.findOne({
      where: { email: registerRequestDto.email },
    });

    if (userExists) {
      throw new ConflictException('Email already exists!');
    }

    const hashedPassword = await this.hashPassword(registerRequestDto.password);

    const newUser = this.userRepository.create({
      email: registerRequestDto.email,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);
  }

  // ACTIVE ACCOUNT
  async genTokenRedisActiveAccount(email: string) {
    // ACTIVE:EMAIL
    await this.redis.del(`ACTIVE:${email}`);

    const activeCode = crypto.randomBytes(32).toString('hex');
    await this.redis.set(`ACTIVE:${email}`, activeCode, 'EX', 60 * 60 * 24);
    return activeCode;
  }

  async generateActiveLink(email: string) {
    const activeCode = await this.genTokenRedisActiveAccount(email);
    const serverHost = this.configService.get<string>('SERVER_HOST');
    const serverPort = this.configService.get<string>('SERVER_PORT');

    const FEURL = `${serverHost}:${serverPort}`;
    return `${FEURL}/api/auth/active-account-verify?email=${email}&code=${activeCode}`;
  }

  async sendActiveAccountEmail(email: string, name: string) {
    const user = await this.userRepository.findOne({
      where: { email, is_active: false },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or already activated.');
    }

    const activeLink = await this.generateActiveLink(email);

    await sendMailActiveAccount(email, name, activeLink);
  }

  async checkActiveCode(email: string, code: string) {
    const storedCode = await this.redis.get(`ACTIVE:${email}`);
    if (!storedCode) {
      throw new UnauthorizedException('Invalid or expired activation code.');
    }

    if (storedCode !== code) {
      throw new UnauthorizedException('Invalid activation code.');
    }

    await this.userRepository.update({ email }, { is_active: true });

    await this.redis.del(`ACTIVE:${email}`);

    return true;
  }

  // RESET PASSWORD
  async genTokenRedisResetPassword(email: string) {
    // RESET:EMAIL
    await this.redis.del(`RESET:${email}`);

    const activeCode = crypto.randomBytes(32).toString('hex');
    await this.redis.set(`RESET:${email}`, activeCode, 'EX', 60 * 60);
    return activeCode;
  }

  async generateResetLink(email: string) {
    const existedEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (!existedEmail) {
      throw new UnauthorizedException('Email not found.');
    }

    const activeCode = await this.genTokenRedisResetPassword(email);
    const serverHost = this.configService.get<string>('SERVER_HOST');
    const serverPort = this.configService.get<string>('SERVER_PORT');

    const FEURL = `${serverHost}:${serverPort}`;
    return `${FEURL}/api/auth/reset-password-verify?email=${email}&code=${activeCode}`;
  }

  async sendResetPasswordEmail(email: string, name: string) {
    const resetLink = await this.generateResetLink(email);

    // Send email
    await sendMailResetPassword(email, name, resetLink);
  }

  async checkResetCode(email: string, code: string) {
    const storedCode = await this.redis.get(`RESET:${email}`);
    if (!storedCode) {
      throw new UnauthorizedException('Invalid or expired reset code.');
    }

    if (storedCode !== code) {
      throw new UnauthorizedException('Invalid reset code.');
    }

    await this.redis.del(`RESET:${email}`);

    return true;
  }

  async changePassword(email: string, code: string, newPassword: string) {
    const isValid = await this.checkResetCode(email, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired reset code.');
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;

    await this.userRepository.save(user);
  }
}
