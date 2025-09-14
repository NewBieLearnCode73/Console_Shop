import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderAddress extends AbstractEntity<OrderAddress> {
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
  to_district_id: number;

  @Column()
  to_province_name: string;

  @OneToOne(() => Order, (order) => order.orderAddress, { cascade: true })
  order: Order;
}
