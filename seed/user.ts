import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/user/entity/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export async function bootstrap(amount = 10, clear = false) {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  if (clear) {
    await userRepository.query('TRUNCATE TABLE "user" CASCADE');
    console.log('🧹 Cleared old users');
  }

  for (let i = 0; i < amount; i++) {
    const user = userRepository.create({
      email: faker.internet.email(),
      password: await bcrypt.hash('123456', 10),
      is_active: true,
    });
    await userRepository.save(user);
    console.log(`👉 Created user: ${user.email} (${user.role})`);
  }

  console.log(`✅ Seeded ${amount} users`);
  await app.close();
}
