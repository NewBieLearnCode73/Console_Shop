import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile extends AbstractEntity<Profile> {
  @PrimaryColumn({ nullable: false })
  user_id: string;

  @Column({ nullable: false })
  fullname: string;

  @Column({ nullable: true })
  avatar_url: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
