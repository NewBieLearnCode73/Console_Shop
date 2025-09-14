import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { ProductStatus } from 'src/constants/product_status.enum';
import { ProductType } from 'src/constants/product_type.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { ProductVariant } from './product_variant.entity';
import { SeoType } from 'src/interfaces/seo_type';

@Entity()
export class Product extends AbstractEntity<Product> implements SeoType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ type: 'enum', enum: ProductType, nullable: false })
  product_type: ProductType;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.INACTIVE,
  })
  status: ProductStatus;

  // SEO fields start
  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({ nullable: false })
  seo_title?: string;

  @Column({ nullable: false })
  seo_description?: string;
  // SEO fields end

  @Column({ default: 0 })
  weight: number; // in grams

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  category: Category;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  brand: Brand;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    nullable: true,
  })
  variants: ProductVariant[];
}
