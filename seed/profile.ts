import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { Profile } from 'src/modules/user/entity/profile.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Repository } from 'typeorm';

export async function bootstrap(clear: boolean) {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const profileRepo = app.get<Repository<Profile>>(getRepositoryToken(Profile));

  if (clear) {
    await profileRepo.clear();
    console.log('🧹 Cleared old profiles');
  }

  const users = await userRepo.find();
  console.log(`👥 Found ${users.length} users`);

  for (const user of users) {
    // Kiểm tra nếu user đã có profile thì bỏ qua
    const existing = await profileRepo.findOne({ where: { user_id: user.id } });
    if (existing) {
      console.log(`⚠️ User ${user.email} already has profile, skipping...`);
      continue;
    }

    const profile = profileRepo.create({
      user_id: user.id,
      fullname: `Profile of ${user.email}`,
    });

    await profileRepo.save(profile);
    console.log(`✅ Created profile for ${user.email}`);
  }

  console.log('🎉 Done seeding profiles!');
  await app.close();
}
