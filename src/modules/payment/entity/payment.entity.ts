import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { PaymentMethod } from 'src/constants/payment_method.enum';
import { PaymentStatus } from 'src/constants/payment_status.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment extends AbstractEntity<Payment> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ unique: true })
  trans_id: string; // Momo

  @Column({ unique: true })
  order_id: string;

  @Column()
  amount: number;

  @Column()
  paid_at: Date;
}
