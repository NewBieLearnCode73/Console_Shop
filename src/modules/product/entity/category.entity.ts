import { AbstractEntity } from 'src/abstracts/abstract_entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { SeoType } from 'src/interfaces/seo_type';

@Entity()
export class Category extends AbstractEntity<Category> implements SeoType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  // Seo fields start
  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({ nullable: false })
  seo_title?: string;

  @Column({ nullable: false })
  seo_description?: string;
  // SEO fields end

  // Self ref relationship
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Product, (product) => product.category, { cascade: true })
  products: Product[];
}
