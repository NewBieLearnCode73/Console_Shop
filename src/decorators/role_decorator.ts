import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/constants/role.enum';

export const ROLE_KEY = 'role';

export const RolesDecorator = (role: Role) => SetMetadata(ROLE_KEY, role);
