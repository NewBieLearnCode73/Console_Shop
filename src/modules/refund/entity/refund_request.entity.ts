import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { RefundStatus } from 'src/constants/refund_status.enum';
import { Order } from 'src/modules/order/entity/order.entity';
import { User } from 'src/modules/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RefundRequest extends AbstractEntity<RefundRequest> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  reason: string;

  @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.PENDING })
  status: RefundStatus;

  @OneToOne(() => Order, (order) => order.refundRequest, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // 1 user can have many refund requests
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  user: User;

  // 1 manager can approve many refund requests
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: User;

  @Column({ nullable: true })
  reviewNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  // 1 admin can approve many refund requests
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  finalizedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  finalizedAt: Date;
}
