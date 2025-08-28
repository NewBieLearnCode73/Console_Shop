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
  ChangePasswordDto,
  registerRequestDto,
  ResetPasswordDto,
} from '../dto/request/auth-request.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  localLogin(@Request() req: AuthenticationRequest) {
    return this.authService.login(req.user);
  }

  @Post('register')
  register(@Body() registerRequestDto: registerRequestDto) {
    return this.authService.register(registerRequestDto);
  }

  @Post('reset-password-request')
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
