import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../entity/profile.entity';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from 'src/modules/supabase/service/supabase.service';
import {
  CreateProfileRequestDto,
  UpdateProfileRequestDto,
} from '../dto/request/profile-request.dto';

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
  async createProfile(
    userId: string,
    createProfileDto: CreateProfileRequestDto,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only create profile if it doesn't exist
    const existingProfile = await this.profileRepository.findOne({
      where: { user_id: user.id },
    });
    if (existingProfile) {
      throw new ConflictException('This user already has a profile!');
    }

    const profile = this.profileRepository.create({
      user_id: user.id,
      ...createProfileDto,
    });
    return this.profileRepository.save(profile);
  }

  // Update profile (Not include image)
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileRequestDto,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileRepository.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Update profile fields
    Object.assign(profile, updateProfileDto);
    return this.profileRepository.save(profile);
  }

  // Update user avatar
  async updateUserAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileRepository.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.avatar_url) {
      await this.deleteUserAvatar(userId);
    }

    try {
      const avatarUrl = await this.supabaseService.uploadUserAvatar(
        file,
        user.id,
      );

      profile.avatar_url = avatarUrl;
      return await this.profileRepository.save(profile);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Upload avatar failed');
    }
  }

  // Delete user avatar
  async deleteUserAvatar(userId: string) {
    try {
      return await this.supabaseService.deleteUserAvatar(userId);
    } catch (error) {
      throw new InternalServerErrorException('Delete avatar failed');
    }
  }
}
