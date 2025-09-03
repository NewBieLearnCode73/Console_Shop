import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from 'src/modules/product/entity/product_variant.entity';

@Entity()
export class OrderItem extends AbstractEntity<OrderItem> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  // Only 1 site
  @ManyToOne(() => ProductVariant, {
    onDelete: 'SET NULL',
    eager: false,
    nullable: true,
  })
  productVariant: ProductVariant;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  order: Order;
}
