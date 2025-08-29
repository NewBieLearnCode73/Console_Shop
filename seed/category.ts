import { NestFactory } from '@nestjs/core';
import { faker } from '@faker-js/faker';
import { AppModule } from 'src/app.module';
import { CategoryService } from 'src/modules/product/service/category.service';

export async function bootstrap(amount = 5) {
  const app = await NestFactory.createApplicationContext(AppModule);
  const categoryService = app.get(CategoryService);

  // tạo root categories
  for (let i = 0; i < amount; i++) {
    const rootCategory = await categoryService.createCategory({
      name: faker.commerce.department(),
      description: faker.commerce.productDescription(),
      seo_title: faker.lorem.sentence(5),
      seo_description: faker.lorem.sentence(10),
    });

    // tạo sub categories
    for (let j = 0; j < 3; j++) {
      await categoryService.createCategory({
        name:
          faker.commerce.productAdjective() + ' ' + faker.commerce.product(),
        description: faker.commerce.productDescription(),
        seo_title: faker.lorem.sentence(5),
        seo_description: faker.lorem.sentence(10),
        parent_id: rootCategory.id, // nối subcategory vào root
      });
    }
  }

  console.log('✅ Category seeding done!');
  await app.close();
}
