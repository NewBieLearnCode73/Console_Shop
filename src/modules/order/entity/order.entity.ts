import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { OrderStatus } from 'src/constants/order_status.enum';
import { OrderType } from 'src/constants/order_type.enum';
import { User } from 'src/modules/user/entity/user.entity';
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

@Entity()
export class Order extends AbstractEntity<Order> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  order_code: string; // Đơn vị vận chuyển cung cấp

  @Column({ type: 'uuid', nullable: true })
  client_order_code: string; // Mã đơn hàng nội bộ

  @Column()
  sub_total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 22000 })
  shipping_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  declaration_fee: number; // Phí khai báo: 0.005 * shipping_fee

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number; // sub_total + discount_amount + shipping_fee + declaration_fee

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status: OrderStatus;

  @Column({ type: 'enum', enum: OrderType })
  order_type: OrderType;

  @Column({ nullable: true })
  expired_at: Date;

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
}
