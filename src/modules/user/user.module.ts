import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Profile } from './entity/profile.entity';
import { Address } from './entity/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Address])],
  controllers: [],
  providers: [],
})
export class UserModule {}
