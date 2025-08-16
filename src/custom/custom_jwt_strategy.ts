import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/interfaces/payload';
import { UserService } from 'src/modules/user/service/user.service';
import { User } from 'src/modules/user/entity/user.entity';

@Injectable()
export class CustomJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user: User | null = await this.userService.findUserById(payload.id);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return user;
  }
}
