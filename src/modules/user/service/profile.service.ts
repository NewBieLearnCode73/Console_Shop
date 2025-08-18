import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../entity/profile.entity';
import { Repository } from 'typeorm';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { User } from '../entity/user.entity';
import { NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/modules/supabase/service/supabase.service';

export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileRepository.findOne({
      where: { user_id: user.id },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  // Create profile (Not include upload image!)
  async createProfile(userId: string, createProfileDto: CreateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = this.profileRepository.create({
      user_id: user.id,
      ...createProfileDto,
    });
    return this.profileRepository.save(profile);
  }

  // Update image
  async updateUserAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const avatarUrl = await this.supabaseService.uploadUserAvatar(
      file,
      user.id,
    );

    const profile = await this.profileRepository.findOne({
      where: { user_id: user.id },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    profile.avatar_url = avatarUrl;
    return this.profileRepository.save(profile);
  }

  // Delete user avatar
  async deleteUserAvatar(userId: string) {
    await this.supabaseService.deleteUserAvatar(userId);
  }
}
