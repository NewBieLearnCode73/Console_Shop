import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Role } from 'src/constants/role.enum';

export class ChangeUserRoleRequestDto {
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}

export class ProvideNewPasswordRequestDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
