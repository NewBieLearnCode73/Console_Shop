import { AbstractEntity } from 'src/abstracts/abstract_entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { SeoType } from 'src/interfaces/seo_type';

@Entity()
export class Brand extends AbstractEntity<Brand> implements SeoType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: false })
  description: string;

  // SEO fields start
  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({ nullable: false })
  seo_title?: string;

  @Column({ nullable: false })
  seo_description?: string;
  // SEO fields end

  @OneToMany(() => Product, (product) => product.brand, { cascade: true })
  products: Product[];
}
