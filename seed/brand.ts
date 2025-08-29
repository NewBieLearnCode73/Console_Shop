// seed/seed-brand.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BrandService } from '../src/modules/product/service/brand.service';
import { faker } from '@faker-js/faker';

export async function bootstrap(amount = 10) {
  const app = await NestFactory.createApplicationContext(AppModule);
  const brandService = app.get(BrandService);

  for (let i = 0; i < amount; i++) {
    await brandService.createBrand({
      name: faker.company.name(), // tên hãng
      description: faker.company.catchPhrase(), // mô tả
      seo_title: faker.lorem.sentence(5),
      seo_description: faker.lorem.sentence(10),
    });
  }

  console.log(`✅ Seeded ${amount} brands successfully!`);
  await app.close();
}
