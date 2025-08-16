import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Profile } from './entity/profile.entity';
import { Address } from './entity/address.entity';
import { UserService } from './service/user.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { UserController } from './controller/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Address]), SupabaseModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [],
})
export class UserModule {}
