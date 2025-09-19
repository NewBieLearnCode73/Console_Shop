import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { OrderStatus } from 'src/constants/order_status.enum';
import { OrderType } from 'src/constants/order_type.enum';
import { PaymentMethod } from 'src/constants/payment_method.enum';
import { User } from 'src/modules/user/entity/user.entity';
import { Payment } from 'src/modules/payment/entity/payment.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderAddress } from './order_address.entity';
import { OrderItem } from './order_item.entity';
import { RefundRequest } from 'src/modules/refund/entity/refund_request.entity';

@Entity()
export class Order extends AbstractEntity<Order> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  order_code: string; // Đơn vị vận chuyển cung cấp

  @Column()
  sub_total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 22000 })
  shipping_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number; // sub_total - discount_amount + shipping_fee

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @Column({ type: 'enum', enum: OrderType })
  order_type: OrderType;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column({ nullable: true, type: 'timestamp' })
  expired_at: Date | null;

  @Column({ nullable: true })
  cancelled_at: Date;

  @Column({ nullable: true })
  completed_at: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn() // user_id
  user: User;

  @OneToOne(() => OrderAddress, (orderAddress) => orderAddress.order, {
    onDelete: 'CASCADE',
  })
  @JoinColumn() // order_address_id
  orderAddress: OrderAddress;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order, { nullable: true })
  payment: Payment | null;

  @OneToOne(() => RefundRequest, (refundRequest) => refundRequest.order, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  refundRequest: RefundRequest | null;
}
