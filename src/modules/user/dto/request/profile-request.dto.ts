import { IsNotEmpty } from 'class-validator';

export class CreateProfileRequestDto {
  @IsNotEmpty()
  fullname: string;
}

export class UpdateProfileRequestDto {
  @IsNotEmpty()
  fullname: string;
}
