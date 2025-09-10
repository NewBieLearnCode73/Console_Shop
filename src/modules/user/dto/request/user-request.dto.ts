import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from 'src/constants/role.enum';

export class ChangeUserRoleRequestDto {
    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;
}
