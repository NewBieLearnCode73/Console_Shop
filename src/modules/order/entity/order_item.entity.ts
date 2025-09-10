import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from 'src/modules/product/entity/product_variant.entity';
import { DigitalKey } from 'src/modules/product/entity/digital_key.entity';

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

  // Option for digital product (game key)
  // Can be null for physical product
  @OneToOne(() => DigitalKey, (digitalKey) => digitalKey.orderItem)
  digitalKey: DigitalKey;
}
