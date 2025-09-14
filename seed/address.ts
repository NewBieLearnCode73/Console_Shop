import { faker } from '@faker-js/faker';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { Address } from 'src/modules/user/entity/address.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Repository } from 'typeorm';
import { parseSeedArgs } from './seed-args';

export async function bootstrap() {
  const { amount, clear } = parseSeedArgs(10);

  const app = await NestFactory.createApplicationContext(AppModule);
  const addressRepository = app.get<Repository<Address>>(
    getRepositoryToken(Address),
  );
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  if (clear) {
    await addressRepository.query('TRUNCATE TABLE "address" CASCADE');
    console.log('🧹 Cleared old addresses');
  }

  const users = await userRepository.find();
  if (users.length === 0) {
    console.error('❌ No users found. Please seed users first.');
    process.exit(1);
  }

  const addresses: Address[] = [];

  for (let i = 0; i < amount; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const address = addressRepository.create({
      to_name: faker.person.fullName(),
      to_phone: faker.phone.number(),
      to_address: faker.location.streetAddress(),
      to_ward_code: faker.string.numeric(6),
      to_district_id: faker.number.int({ min: 1, max: 700 }),
      to_province_name: faker.location.city(),
      user: randomUser,
    });

    addresses.push(address);
  }

  await addressRepository.save(addresses);
  console.log(`✅ Seeded ${amount} addresses`);

  process.exit(1);
}
