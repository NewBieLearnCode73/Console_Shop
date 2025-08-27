import { AbstractEntity } from 'src/abstracts/abstract_entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariant } from './product_variant.entity';

@Entity()
export class ProductImage extends AbstractEntity<ProductImage> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  product_url: string;

  @Column({ nullable: false, default: false })
  is_main: boolean;

  @ManyToOne(() => ProductVariant, (productVariant) => productVariant.images, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  productVariant: ProductVariant;
}
