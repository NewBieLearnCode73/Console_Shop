import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import { LocalAuthGuard } from 'src/guards/local_auth.guard';
import { GoogleOAuthGuard } from 'src/guards/google_oauth.guard';
import { FacebookOAuthGuard } from 'src/guards/facebook_oauth.guard';
import {
  ActiveAccountRequestDto,
  ChangePasswordDto,
  provideNewPairTokenDto,
  registerRequestDto,
  ResetPasswordDto,
} from '../dto/request/auth-request.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async localLogin(
    @Request() req: AuthenticationRequest,
    @Res() res: ExpressResponse,
  ) {
    try {
      const tokens = await this.authService.login(req.user);

      // Set cookies
      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie('user_id', req.user.id, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).send({ message: 'Login successful' });
    } catch (error) {
      console.error('Local login error:', error);
      return { message: 'Login failed', error: error };
    }
  }

  @Post('register')
  async register(@Body() registerRequestDto: registerRequestDto) {
    return this.authService.register(registerRequestDto);
  }

  @Post('provide-new-pair-token')
  async provideToken(@Body() provideNewPairTokenDto: provideNewPairTokenDto) {
    return this.authService.provideTokenPair(
      provideNewPairTokenDto.refreshToken,
    );
  }

  @Get('provide-new-access-token')
  async provideNewAccessToken(
    @Req() req: ExpressRequest,
    @Res() res: ExpressResponse,
  ) {
    const refresh_token = req.cookies['refresh_token'] || '';
    const access_token =
      await this.authService.provideNewAccessToken(refresh_token);

    try {
      // Set cookie
      res.cookie('access_token', access_token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return res.status(200).send({ message: 'Provide new access token' });
    } catch (error) {
      console.error('Provide new access token error:', error);
      return res
        .status(500)
        .send({ message: 'Provide new access token failed', error: error });
    }
  }

  @Post('logout')
  async logout(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    try {
      const access_token = req.cookies['access_token'];
      const refresh_token = req.cookies['refresh_token'];
      const user_id = req.cookies['user_id'];

      await this.authService.logout(access_token, refresh_token, user_id);

      res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.clearCookie('user_id', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.status(200).send({ message: 'Logout successful' });
    } catch (error) {
      return res.status(500).send({ message: 'Logout failed', error: error });
    }
  }

  @Post('active-account-request')
  async activeAccount(
    @Body() activeAccountRequestDto: ActiveAccountRequestDto,
  ) {
    return this.authService.sendActiveAccountEmail(
      activeAccountRequestDto.email,
      activeAccountRequestDto.email,
    );
  }

  @Get('active-account-verify')
  async verifyActiveAccount(@Query() query: { email: string; code: string }) {
    return await this.authService.checkActiveCode(query.email, query.code);
  }

  @Post('reset-password-request')
  @UseGuards(ThrottlerGuard)
  // @Throttle('reset-password-request') // 3 requests per hour
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.sendResetPasswordEmail(
      resetPasswordDto.email,
      resetPasswordDto.email, // modify here
    );
  }

  @Post('reset-password-verify')
  async verifyResetPassword(
    @Query() query: { email: string; code: string },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      query.email,
      query.code,
      changePasswordDto.newPassword,
    );
  }

  // Login with google
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleLogin() {}

  @Get('/oauth2/callback/google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(
    @Request() req: AuthenticationRequest,
    @Res() res: ExpressResponse,
  ) {
    //  return this.authService.login(req.user);
    try {
      const tokens = await this.authService.login(req.user);

      // Set cookies
      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.cookie('user_id', req.user.id, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Response
      // res.redirect(this.configService.getOrThrow('FRONTEND_URL'));
      res.send(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            (function() {
              try {
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({ type: 'OAUTH_SUCCESS' }, "${this.configService.getOrThrow('FRONTEND_URL')}");
                  window.close();
                } else {
                  window.location.href = "${this.configService.getOrThrow('FRONTEND_URL')}";
                }
              } catch (err) {
                console.error("OAuth callback error:", err);
                window.location.href = "${this.configService.getOrThrow('FRONTEND_URL')}";
              }
            })();
          </script>
        </body>
      </html>
    `);
    } catch (error) {
      console.error('Google login error:', error);
      res.status(500).send({ message: 'Login failed', error: error });
    }
  }

  // Login with facebook
  @Get('facebook')
  @UseGuards(FacebookOAuthGuard)
  async facebookLogin() {}

  @Get('oauth2/callback/facebook')
  @UseGuards(FacebookOAuthGuard)
  async facebookAuthCallback(
    @Request() req: AuthenticationRequest,
    @Res() res: ExpressResponse,
  ) {
    try {
      const tokens = await this.authService.login(req.user);
      // Set cookies
      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.cookie('user_id', req.user.id, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Response
      res.redirect(this.configService.getOrThrow('FRONTEND_URL'));
    } catch (error) {
      res.status(500).send({ message: 'Login failed', error: error });
      console.error('Facebook login error:', error);
    }
  }
}
