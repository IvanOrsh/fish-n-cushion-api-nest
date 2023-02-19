import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Follow } from './entities/follow.entity';
import { ProfileType } from './types/profile.type';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
  ) {}

  async getProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.usersRepository.findOneBy({
      username: profileUsername,
    });

    if (!user) {
      throw new HttpException(
        `Profile with the username ${profileUsername} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      ...user,
      following: false,
    };
  }

  async followProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.usersRepository.findOneBy({
      username: profileUsername,
    });

    if (!user) {
      throw new HttpException(
        `Profile with the username ${profileUsername} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (currentUserId === user.id) {
      throw new HttpException(
        'Follower and Following cannot be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.followsRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });

    if (!follow) {
      const followToCreate = await this.followsRepository.create({
        followerId: currentUserId,
        followingId: user.id,
      });

      await this.followsRepository.save(followToCreate);
    }

    return {
      ...user,
      following: true,
    };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return {
      profile,
    };
  }
}
