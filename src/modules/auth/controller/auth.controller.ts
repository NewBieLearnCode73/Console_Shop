import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthenticationRequest } from 'src/interfaces/authentication_request';
import { LocalAuthGuard } from 'src/guards/local_auth.guard';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from 'src/guards/jwt_auth.guard';
import { RolesDecorator } from 'src/decorators/role_decorator';
import { Role } from 'src/constants/role.enum';
import { RolesGuard } from 'src/guards/role.guard';
import { GoogleOAuthGuard } from 'src/guards/google_oauth.guard';
import { FacebookOAuthGuard } from 'src/guards/facebook_oauth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  localLogin(@Request() req: AuthenticationRequest) {
    return this.authService.login(req.user);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('checkJwt')
  @UseGuards(JwtAuthGuard)
  checkJwt(@Request() req: AuthenticationRequest) {
    console.log('JWT Payload:', req.user);
    return { message: 'JWT is valid' };
  }

  @Get('test')
  @RolesDecorator(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  test() {
    return {
      message: 'This is a test endpoint',
    };
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleLogin() {}

  @Get('/oauth2/callback/google')
  @UseGuards(GoogleOAuthGuard)
  googleAuthCallback(@Request() req: AuthenticationRequest) {
    return this.authService.login(req.user);
  }

  @Get('facebook')
  @UseGuards(FacebookOAuthGuard)
  async facebookLogin() {}

  @Get('oauth2/callback/facebook')
  @UseGuards(FacebookOAuthGuard)
  facebookAuthCallback(@Request() req: AuthenticationRequest) {
    return this.authService.login(req.user);
  }
}
