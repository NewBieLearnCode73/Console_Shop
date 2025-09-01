import { IsEmail, IsJWT, IsNotEmpty, IsUUID, Length } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class registerRequestDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 20)
  password: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @Length(6, 20)
  newPassword: string;
}

export class ActiveAccountRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class LogoutRequestDto {
  @IsNotEmpty()
  @IsJWT()
  accessToken: string;

  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;
}

export class provideNewPairTokenDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}
