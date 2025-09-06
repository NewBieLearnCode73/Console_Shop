/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { Product } from '../src/modules/product/entity/product.entity';
import { Stock } from '../src/modules/product/entity/stock.entity';
import { v4 as uuidv4 } from 'uuid';
import { ProductVariant } from 'src/modules/product/entity/product_variant.entity';
import { ProductImage } from 'src/modules/product/entity/product_image.entity';
import { DigitalKey } from 'src/modules/product/entity/digital_key.entity';

export async function bootstrap(amount = 5) {
  const app = await NestFactory.createApplicationContext(AppModule);

  const productRepository = app.get<Repository<Product>>(
    getRepositoryToken(Product),
  );
  const variantRepository = app.get<Repository<ProductVariant>>(
    getRepositoryToken(ProductVariant),
  );
  const stockRepository = app.get<Repository<Stock>>(getRepositoryToken(Stock));
  const imageRepository = app.get<Repository<ProductImage>>(
    getRepositoryToken(ProductImage),
  );
  const digitalKeyRepository = app.get<Repository<DigitalKey>>(
    getRepositoryToken(DigitalKey),
  );

  const products = await productRepository.find();
  if (products.length === 0) {
    console.error('❌ You need to seed products first!');
    await app.close();
    return;
  }

  // ----- PHYSICAL VARIANTS -----
  for (let i = 0; i < amount; i++) {
    const product = faker.helpers.arrayElement(products);

    const variantName =
      faker.commerce.productAdjective() +
      ' ' +
      faker.commerce.productMaterial();
    const variant = variantRepository.create({
      product,
      variant_name: variantName,
      slug: faker.helpers.slugify(variantName.toLowerCase()),
      sku: `SKU-${product.id}-${faker.string.alphanumeric(6)}`,
      // Cost price phải nhỏ hơn price
      cost_price: faker.number.int({ min: 50, max: 1000 }),
      price: faker.number.int({ min: 100, max: 2000 }),
      color: faker.color.human(),
      other_attributes: {
        color: faker.color.human(),
        ram: faker.helpers.arrayElement(['8GB', '16GB', '32GB']),
        storage: faker.helpers.arrayElement([
          '256GB SSD',
          '512GB SSD',
          '1TB SSD',
        ]),
      },
    });
    const savedVariant = await variantRepository.save(variant);

    const stock = stockRepository.create({
      quantity: 20, // fixed stock
      variant: savedVariant,
    });
    await stockRepository.save(stock);

    // Fake main image
    const mainImage = imageRepository.create({
      is_main: true,
      product_url: `https://picsum.photos/seed/${uuidv4()}/600/600`,
      productVariant: savedVariant,
    });
    await imageRepository.save(mainImage);

    // Fake gallery images
    const galleryImages = Array.from({ length: 3 }).map(() =>
      imageRepository.create({
        is_main: false,
        product_url: `https://picsum.photos/seed/${uuidv4()}/600/600`,
        productVariant: savedVariant,
      }),
    );
    await imageRepository.save(galleryImages);
  }

  // ----- DIGITAL VARIANTS -----
  for (let i = 0; i < amount; i++) {
    const product = faker.helpers.arrayElement(products);

    const variantName = `Digital ${faker.commerce.productName()}`;
    const variant = variantRepository.create({
      product,
      variant_name: variantName,
      slug: faker.helpers.slugify(variantName.toLowerCase()),
      sku: `SKU-${product.id}-${faker.string.alphanumeric(6)}`,
      price: faker.number.int({ min: 50, max: 500 }),
      other_attributes: {
        edition: faker.helpers.arrayElement(['Standard', 'Deluxe', 'Ultimate']),
        platform: faker.helpers.arrayElement(['Steam', 'Epic', 'Origin']),
      },
    });
    const savedVariant = await variantRepository.save(variant);

    // Generate 10 digital keys
    const keys = Array.from({ length: 10 }).map(() =>
      digitalKeyRepository.create({
        variant: savedVariant,
        hash_key_code: faker.string.uuid(),
        key_code: faker.string.alphanumeric(20),
      }),
    );
    await digitalKeyRepository.save(keys);

    // Stock = số lượng keys
    const stock = stockRepository.create({
      quantity: keys.length,
      variant: savedVariant,
    });
    await stockRepository.save(stock);

    // Fake main image
    const mainImage = imageRepository.create({
      is_main: true,
      product_url: `https://picsum.photos/seed/${uuidv4()}/600/600`,
      productVariant: savedVariant,
    });
    await imageRepository.save(mainImage);

    // Fake gallery images
    const galleryImages = Array.from({ length: 2 }).map(() =>
      imageRepository.create({
        is_main: false,
        product_url: `https://picsum.photos/seed/${uuidv4()}/600/600`,
        productVariant: savedVariant,
      }),
    );
    await imageRepository.save(galleryImages);
  }

  console.log('✅ ProductVariant seeding done!');
  await app.close();
}
