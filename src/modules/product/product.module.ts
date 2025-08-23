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
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [],
})
export class ProductModule {}
