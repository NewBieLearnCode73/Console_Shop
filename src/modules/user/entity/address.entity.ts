import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Address extends AbstractEntity<Address> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  to_name: string;

  @Column()
  to_phone: string;

  @Column()
  to_address: string;

  @Column()
  to_ward_code: string;

  @Column()
  to_district_id: string;

  @Column()
  to_province_name: string;

  @Column({ default: false })
  is_default: boolean;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;
}
