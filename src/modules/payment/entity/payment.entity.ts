import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { PaymentMethod } from 'src/constants/payment_method.enum';
import { PaymentStatus } from 'src/constants/payment_status.enum';
import { Order } from 'src/modules/order/entity/order.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment extends AbstractEntity<Payment> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ type: 'varchar', unique: true, nullable: true })
  trans_id: string | null;

  @Column({ unique: true })
  order_id: string;

  @Column()
  amount: number;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date | null;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
