import { AbstractEntity } from 'src/abstracts/abstract_entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariant } from './product_variant.entity';

@Entity()
export class Stock extends AbstractEntity<Stock> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0, nullable: false })
  quantity: number;

  @Column({ default: 0, nullable: false })
  reserved: number;

  @OneToOne(() => ProductVariant, (variant) => variant.stock, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  variant: ProductVariant;
}
