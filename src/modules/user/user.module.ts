import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Profile } from './entity/profile.entity';
import { Address } from './entity/address.entity';
import { UserService } from './service/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Address])],
  controllers: [],
  providers: [UserService],
  exports: [],
})
export class UserModule {}
