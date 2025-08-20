import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { UserService } from '../modules/user/service/user.service';
import { ConfigService } from '@nestjs/config';
import { VerifiedCallback } from 'passport-jwt';
import { ProfileResponse } from 'src/interfaces/oauth_profile_response';
import { ProfileService } from 'src/modules/user/service/profile.service';

@Injectable()
export class CustomFacebookStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.getOrThrow('FACEBOOK_CLIENT_ID'),
      clientSecret: configService.getOrThrow('FACEBOOK_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('FACEBOOK_CLIENT_CALLBACK_URL'),
      profileFields: ['displayName', 'emails', 'photos'],
      scope: ['email', 'public_profile'],
      enableProof: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: ProfileResponse,
    done: VerifiedCallback,
  ) {
    const { displayName, emails } = profile;

    console.log('Facebook profile:', profile);

    const user = await this.userService.findUserByEmail(emails[0].value);

    if (!user) {
      const user = await this.userService.createNewUser(emails[0].value);
      // Create Profile
      await this.profileService.createProfile(user.id, {
        fullname: displayName,
      });

      done(null, user);
    }
    return done(null, user);
  }
}
