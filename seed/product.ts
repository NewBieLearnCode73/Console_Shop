import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProductService } from '../src/modules/product/service/product.service';
import { Category } from '../src/modules/product/entity/category.entity';
import { Brand } from '../src/modules/product/entity/brand.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { ProductType } from 'src/constants/product_type.enum';

export async function bootstrap(amount = 10) {
  const app = await NestFactory.createApplicationContext(AppModule);

  const productService = app.get(ProductService);
  const categoryRepository = app.get<Repository<Category>>(
    getRepositoryToken(Category),
  );
  const brandRepository = app.get<Repository<Brand>>(getRepositoryToken(Brand));

  const categories = await categoryRepository.find();
  const brands = await brandRepository.find();

  if (categories.length === 0 || brands.length === 0) {
    console.error('❌ You need to seed categories and brands first!');
    await app.close();
    return;
  }

  for (let i = 0; i < amount; i++) {
    const randomCategory = faker.helpers.arrayElement(categories);
    const randomBrand = faker.helpers.arrayElement(brands);

    await productService.createProduct({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      product_type: faker.helpers.arrayElement([
        ProductType.DEVICE,
        ProductType.CARD_PHYSICAL,
        ProductType.CARD_DIGITAL_KEY,
      ]),
      weight: faker.number.float({ min: 100, max: 5000 }), // weight in grams
      seo_title: faker.lorem.sentence(5),
      seo_description: faker.lorem.sentence(10),
      category_id: randomCategory.id,
      brand_id: randomBrand.id,
    });
  }

  console.log('✅ Product seeding done!');
  await app.close();
}
