import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
