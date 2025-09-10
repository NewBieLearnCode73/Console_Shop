import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../modules/user/service/user.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/user/entity/user.entity';
import { JwtPayload } from 'src/interfaces/payload';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CustomJwtCookieStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
  private currentToken: string | null = null;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectRedis()
    private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (req && req.cookies) {
            const token = req.cookies['access_token'];
            console.log('Extracted Token from Cookie:', token);
            this.currentToken = token; // Store for later use
            return token || null;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // Check if the current token is blacklisted
    if (this.currentToken) {
      const isBlacklisted = await this.redis.get(`BLACKLIST:ACCESS:${this.currentToken}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Access token is blacklisted! Please log in again.');
      }
    }

    const user: User | null = await this.userService.findUserById(payload.id);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return user;
  }
}
