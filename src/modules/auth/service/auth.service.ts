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
import { registerRequestDto } from '../dto/request/auth-request.dto';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import {
  sendMailResetPassword,
  sendMailActiveAccount,
} from 'src/utils/brevo_helper';
import { KafkaService } from 'src/modules/kafka/service/kafka.service';

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
    private readonly kafkaService: KafkaService,
  ) { }
  getTTLToken(token: string): number {
    try {
      if (!token) return 0;

      const decodeToken = this.jwtService.decode(token);

      if (!decodeToken?.exp) return 0;

      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, decodeToken.exp - currentTime);
    } catch {
      return 0;
    }
  }

  async pushAccessTokenToBlackList(token: string, userId: string, ttl: number) {
    await this.redis.set(`BLACKLIST:ACCESS:${token}`, userId, 'EX', ttl);
  }

  async pushRefreshTokenToBlackList(
    token: string,
    userId: string,
    ttl: number,
  ) {
    await this.redis.set(`BLACKLIST:REFRESH:${token}`, userId, 'EX', ttl);
  }

  async addAccessTokensToZSet(
    userId: string,
    accessToken: string,
    ttl: number,
    limit = 3,
  ) {
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + ttl;

    // Clean up expired tokens
    await this.redis.zremrangebyscore(
      `USER_ACCESS_TOKENS_SET:${userId}`,
      0,
      now,
    );
    await this.redis.zadd(
      `USER_ACCESS_TOKENS_SET:${userId}`,
      expiry,
      accessToken,
    );

    // Check limit
    const tokenCount = await this.redis.zcard(
      `USER_ACCESS_TOKENS_SET:${userId}`,
    );
    if (tokenCount > limit) {
      // Get oldest token (Smallest score) __ GET AND REMOVE IN 1 TIME
      const [oldestToken, expiry] = await this.redis.zpopmin(
        `USER_ACCESS_TOKENS_SET:${userId}`,
      );

      if (oldestToken) {
        const remainingTTL = this.getTTLToken(oldestToken);

        await this.pushAccessTokenToBlackList(
          oldestToken,
          userId,
          remainingTTL,
        );

        await this.redis.del(`ACCESS_TOKEN:${oldestToken}`);
      }
    }
  }

  async addRefreshTokensToZSet(
    userId: string,
    refreshToken: string,
    ttl: number,
    limit = 3,
  ) {
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + ttl;

    // Clean up expired tokens
    await this.redis.zremrangebyscore(
      `USER_REFRESH_TOKENS_SET:${userId}`,
      0,
      now,
    );
    await this.redis.zadd(
      `USER_REFRESH_TOKENS_SET:${userId}`,
      expiry,
      refreshToken,
    );

    // Check limit
    const tokenCount = await this.redis.zcard(
      `USER_REFRESH_TOKENS_SET:${userId}`,
    );
    if (tokenCount > limit) {
      // Remove oldest token (Smallest score) __ GET AND REMOVE IN 1 TIME
      const [oldestToken, expiry] = await this.redis.zpopmin(
        `USER_REFRESH_TOKENS_SET:${userId}`,
      );

      if (oldestToken) {
        const remainingTTL = this.getTTLToken(oldestToken);

        await this.pushRefreshTokenToBlackList(
          oldestToken,
          userId,
          remainingTTL,
        );

        await this.redis.del(`REFRESH_TOKEN:${oldestToken}`);
      }
    }
  }

  async deleteAccessTokenFromZset(userId: string, accessToken: string) {
    await this.redis.zrem(`USER_ACCESS_TOKENS_SET:${userId}`, accessToken);
  }

  async deleteRefreshTokenFromZset(userId: string, refreshToken: string) {
    await this.redis.zrem(`USER_REFRESH_TOKENS_SET:${userId}`, refreshToken);
  }

  async saveAccessToken(userId: string, accessToken: string) {
    const ttl = this.getTTLToken(accessToken);
    await this.redis.set(`ACCESS_TOKEN:${accessToken}`, userId, 'EX', ttl);
    await this.addAccessTokensToZSet(userId, accessToken, ttl);
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    const ttl = this.getTTLToken(refreshToken);
    await this.redis.set(`REFRESH_TOKEN:${refreshToken}`, userId, 'EX', ttl);
    await this.addRefreshTokensToZSet(userId, refreshToken, ttl);
  }

  // Provide a new access token and refresh token pair
  async provideTokenPair(refreshToken: string) {
    // Check in black list
    const isBlacklisted = await this.redis.get(
      `BLACKLIST:REFRESH:${refreshToken}`,
    );
    if (isBlacklisted)
      throw new UnauthorizedException('Refresh token is blacklisted');

    const userId = await this.redis.get(`REFRESH_TOKEN:${refreshToken}`);
    if (!userId) throw new UnauthorizedException('Invalid refresh token');

    const newAccessToken = this.jwtService.sign(
      { id: userId },
      { expiresIn: this.configService.get<string>('ACCESS_EXPIRE') },
    );
    const newRefreshToken = this.jwtService.sign(
      { id: userId },
      { expiresIn: this.configService.get<string>('REFRESH_EXPIRE') },
    );

    const ttl = this.getTTLToken(refreshToken);
    if (ttl > 0) {
      await this.pushRefreshTokenToBlackList(refreshToken, userId, ttl);
    }

    await this.redis.del(`REFRESH_TOKEN:${refreshToken}`);
    await this.redis.zrem(`USER_REFRESH_TOKENS_SET:${userId}`, refreshToken);

    await this.saveAccessToken(userId, newAccessToken);
    await this.saveRefreshToken(userId, newRefreshToken);

    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  }

  async provideNewAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // Check in black list
    const isBlacklisted = await this.redis.get(
      `BLACKLIST:REFRESH:${refreshToken}`,
    );
    if (isBlacklisted)
      throw new UnauthorizedException('Refresh token is blacklisted');

    const userId = await this.redis.get(`REFRESH_TOKEN:${refreshToken}`);
    if (!userId) throw new UnauthorizedException('Invalid refresh token');

    const newAccessToken = this.jwtService.sign(
      { id: userId },
      { expiresIn: this.configService.get<string>('ACCESS_EXPIRE') },
    );

    await this.saveAccessToken(userId, newAccessToken);

    return newAccessToken;
  }

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

  async login(user: User) {
    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
      role: user.role,
    };
    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.getOrThrow<string>('ACCESS_EXPIRE'),
    });
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.getOrThrow<string>('REFRESH_EXPIRE'),
    });

    await this.saveAccessToken(user.id, access_token);
    await this.saveRefreshToken(user.id, refresh_token);

    return {
      access_token,
      refresh_token,
    };
  }

  async logout(accessToken: string, refreshToken: string) {
    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Missing tokens for logout');
    }

    const userId = (await this.redis.get(`ACCESS_TOKEN:${accessToken}`)) || '';

    const accessTokenTtl = this.getTTLToken(accessToken);
    const refreshTokenTtl = this.getTTLToken(refreshToken);

    await this.pushAccessTokenToBlackList(accessToken, userId, accessTokenTtl);
    await this.pushRefreshTokenToBlackList(
      refreshToken,
      userId,
      refreshTokenTtl,
    );

    await this.deleteAccessTokenFromZset(userId, accessToken);
    await this.deleteRefreshTokenFromZset(userId, refreshToken);

    await this.redis.del(`ACCESS_TOKEN:${accessToken}`);
    await this.redis.del(`REFRESH_TOKEN:${refreshToken}`);
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

    // Send email to user to active account
    this.kafkaService.sendEvent('auth_send_mail_register', {
      email: newUser.email,
    });
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
    const frontEndHost = this.configService.getOrThrow<string>('FRONTEND_URL');

    return `${frontEndHost}/api/auth/reset-password-verify?email=${email}&code=${activeCode}`;
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

  async changePasswordWithOldPassword(
    oldPassword: string,
    newPassword: string,
    userId: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect.');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }
}
