import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
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
  registerRequestDto,
  ResetPasswordDto,
} from '../dto/request/auth-request.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  localLogin(@Request() req: AuthenticationRequest) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() registerRequestDto: registerRequestDto) {
    return this.authService.register(registerRequestDto);
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
  googleAuthCallback(@Request() req: AuthenticationRequest) {
    return this.authService.login(req.user);
  }

  // Login with facebook
  @Get('facebook')
  @UseGuards(FacebookOAuthGuard)
  async facebookLogin() {}

  @Get('oauth2/callback/facebook')
  @UseGuards(FacebookOAuthGuard)
  facebookAuthCallback(@Request() req: AuthenticationRequest) {
    return this.authService.login(req.user);
  }
}
