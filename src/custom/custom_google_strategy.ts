import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { GoogleProfileResponse } from 'src/interfaces/google_profile_response';
import { UserService } from 'src/modules/user/service/user.service';

@Injectable()
export class CustomGoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GOOGLE_CLIENT_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfileResponse,
    done: VerifyCallback,
  ) {
    const { id, displayName, emails, photos } = profile;

    const user = await this.userService.findUserByEmail(emails[0].value);
    if (!user) {
      const user = await this.userService.createNewUser(emails[0].value);
      done(null, user);
    }
    return done(null, user);
  }
}
