import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../modules/user/service/user.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/user/entity/user.entity';
import { JwtPayload } from 'src/interfaces/payload';

@Injectable()
export class CustomJwtCookieStrategy extends PassportStrategy(
  Strategy,
  'jwt-cookie',
) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (req && req.cookies) {
            return req.cookies['access_token'];
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user: User | null = await this.userService.findUserById(payload.id);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return user;
  }
}
