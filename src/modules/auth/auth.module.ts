import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './service/auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './controller/auth.controller';
import { CustomLocalStrategy } from 'src/custom/custom_local_strategy';
import { CustomJwtStrategy } from 'src/custom/custom_jwt_strategy';
import { CustomGoogleStrategy } from 'src/custom/custom_google_strategy';
import { CustomFacebookStrategy } from 'src/custom/custom_facebook_strategy';
import { validateLoginDtoMiddleware } from 'src/middlewares/validatedto.middleware';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),
    PassportModule,

    // Config for JwtService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CustomLocalStrategy,
    CustomJwtStrategy,
    CustomGoogleStrategy,
    CustomFacebookStrategy,
    validateLoginDtoMiddleware,
    ConfigModule,
    RedisModule,
  ],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(validateLoginDtoMiddleware)
      .forRoutes({ path: 'api/auth/login', method: RequestMethod.POST });
  }
}
