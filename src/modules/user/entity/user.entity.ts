import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { Role } from 'src/constants/role.enum';
import {
  Column,
  Entity,
  Generated,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Address } from './address.entity';

@Entity()
export class User extends AbstractEntity<User> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER,
  })
  role: Role;

  @Column({ default: false })
  is_active: boolean;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];
}
