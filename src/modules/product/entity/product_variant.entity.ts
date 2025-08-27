import { AbstractEntity } from 'src/abstracts/abstract_entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductImage } from './product_image.entity';
import { Stock } from './stock.entity';
import { DigitalKey } from './digital_key.entity';

@Entity()
export class ProductVariant extends AbstractEntity<ProductVariant> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  variant_name: string;

  @Column({ nullable: true, unique: true })
  slug: string;

  @Column({ nullable: false, unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 2,
    scale: 0,
    default: 0,
  })
  discount: number;

  @Column({ nullable: true })
  color?: string;

  @Column({ type: 'jsonb', nullable: true })
  other_attributes: Record<string, any>;

  @OneToMany(() => ProductImage, (image) => image.productVariant, {
    cascade: true,
  })
  images: ProductImage[];

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  product: Product;

  @OneToOne(() => Stock, (stock) => stock.variant, {
    cascade: true,
  })
  stock: Stock;

  @OneToMany(() => DigitalKey, (digitalKey) => digitalKey.variant, {
    cascade: true,
  })
  digitalKeys: DigitalKey[];
}
