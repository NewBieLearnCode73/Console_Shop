import { User } from 'src/modules/user/entity/user.entity';

export class AuthenticationRequest extends Request {
  user: User;
}
