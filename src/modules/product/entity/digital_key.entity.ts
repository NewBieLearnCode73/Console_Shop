import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { KeyStatus } from 'src/constants/key_status.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariant } from './product_variant.entity';
import { OrderItem } from 'src/modules/order/entity/order_item.entity';

@Entity()
export class DigitalKey extends AbstractEntity<DigitalKey> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  hash_key_code: string;

  @Column({ nullable: false, unique: true })
  key_code: string;

  @Column({
    type: 'enum',
    enum: KeyStatus,
    nullable: false,
    default: KeyStatus.UNUSED,
  })
  status: KeyStatus;

  @Column({ nullable: true, default: null })
  active_at: Date;

  @ManyToOne(() => ProductVariant, (variant) => variant.digitalKeys, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  variant: ProductVariant;

  //Khi xóa order item thì không xóa digital key mà chỉ set null để giữ lại key đã bán
  //Vì có thể cần tra cứu lại lịch sử key đã bán
  //Chỉ xóa key khi xóa product variant
  @OneToOne(() => OrderItem, (orderItem) => orderItem.digitalKey, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  orderItem: OrderItem;
}
