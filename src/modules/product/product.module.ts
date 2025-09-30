import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { Brand } from './entity/brand.entity';
import { DigitalKey } from './entity/digital_key.entity';
import { ProductImage } from './entity/product_image.entity';
import { ProductVariant } from './entity/product_variant.entity';
import { Product } from './entity/product.entity';
import { Stock } from './entity/stock.entity';
import { CategoryController } from './controller/category.controller';
import { CategoryService } from './service/category.service';
import { BrandController } from './controller/brand.controller';
import { BrandService } from './service/brand.service';
import { ProductController } from './controller/product.controller';
import { ProductService } from './service/product.service';
import { ProductVariantController } from './controller/product-variant.controller';
import { ProductVariantService } from './service/product_variant.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { Order } from '../order/entity/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Brand,
      DigitalKey,
      ProductImage,
      ProductVariant,
      Product,
      Stock,
      Order,
    ]),
    SupabaseModule,
  ],
  controllers: [
    CategoryController,
    BrandController,
    ProductController,
    ProductVariantController,
  ],
  providers: [
    CategoryService,
    BrandService,
    ProductService,
    ProductVariantService,
  ],
  exports: [ProductVariantService],
})
export class ProductModule {}
