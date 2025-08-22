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
import { SeoType } from 'src/interfaces/seo_type';

@Entity()
export class ProductVariant
  extends AbstractEntity<ProductVariant>
  implements SeoType
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  // SEO fields start
  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({ nullable: false })
  seo_title?: string;

  @Column({ nullable: false })
  seo_description?: string;
  // SEO fields end

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 2,
    scale: 0,
    default: 0,
  })
  discount: number;

  @Column({ nullable: false })
  color: string;

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
