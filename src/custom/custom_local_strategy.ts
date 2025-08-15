import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local'; // Local
import { AuthService } from 'src/modules/auth/service/auth.service';
import { User } from 'src/modules/user/entity/user.entity';

@Injectable()
export class CustomLocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(email, password);
    return user;
  }
}
