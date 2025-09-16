import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Profile } from './entity/profile.entity';
import { Address } from './entity/address.entity';
import { UserService } from './service/user.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { UserController } from './controller/user.controller';
import { ProfileService } from './service/profile.service';
import { ProfileController } from './controller/profile.controller';
import { AddresController } from './controller/address.controller';
import { AddressService } from './service/address.service';
import { KafkaModule } from '../kafka/kafka.module';
import { UserConsumer } from './controller/user.consumer';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Address]),
    SupabaseModule,
    KafkaModule,
  ],
  controllers: [
    UserController,
    ProfileController,
    AddresController,
    UserConsumer,
  ],
  providers: [UserService, ProfileService, AddressService],
  exports: [UserService, ProfileService, AddressService],
})
export class UserModule {}
