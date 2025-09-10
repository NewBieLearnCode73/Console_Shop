import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { ProfileResponse } from 'src/interfaces/oauth_profile_response';
import { ProfileService } from 'src/modules/user/service/profile.service';
import { UserService } from 'src/modules/user/service/user.service';

@Injectable()
export class CustomGoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
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
    profile: ProfileResponse,
    done: VerifyCallback,
  ) {
    const { displayName, emails } = profile;

    console.log('Google profile:', profile);

    const user = await this.userService.findUserByEmail(emails[0].value);
    if (!user) {
      const user = await this.userService.createNewUser(emails[0].value);
      // Create profile
      await this.profileService.createProfile(user.id, {
        fullname: displayName,
      });
      done(null, user);
    } else {
      if (!user?.is_active) {
        await this.userService.activeUserById(user?.id);
      }
      return done(null, user);
    }
  }
}
