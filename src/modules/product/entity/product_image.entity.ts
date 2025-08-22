import { AbstractEntity } from 'src/abstracts/abstract_entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariant } from './product_variant.entity';
import { SeoType } from 'src/interfaces/seo_type';

@Entity()
export class ProductImage
  extends AbstractEntity<ProductImage>
  implements SeoType
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  product_url: string;

  @Column({ nullable: false, default: false })
  is_main: boolean;

  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({ nullable: false })
  seo_title?: string;

  @Column({ nullable: false })
  seo_description?: string;

  @ManyToOne(() => ProductVariant, (productVariant) => productVariant.images, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  productVariant: ProductVariant;
}
