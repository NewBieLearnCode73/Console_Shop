import { AbstractEntity } from 'src/abstracts/abstract_entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RefundRequest } from './refund_request.entity';

@Entity()
export class Refund extends AbstractEntity<Refund> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @OneToOne(() => RefundRequest, (refundRequest) => refundRequest.refund, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  refundRequest: RefundRequest;
}
