import { Expose } from 'class-transformer';

export class UserWithProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  role: string;

  @Expose()
  email: string;

  @Expose()
  is_active: boolean;

  @Expose()
  profile: {
    fullname: string;
    avatar_url: string;
  };
}
