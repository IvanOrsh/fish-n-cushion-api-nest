import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../users/decorators/user.decorator';
import { AuthGuard } from '../users/guards/auth.guard';
import { ProfilesService } from './profiles.service';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':username')
  async getProfile(
    @CurrentUser('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profilesService.getProfile(
      currentUserId,
      profileUsername,
    );
    return this.profilesService.buildProfileResponse(profile);
  }

  @Post(`:username/follow`)
  @UseGuards(AuthGuard)
  async followProfile(
    @CurrentUser('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseInterface> {
    const followed = await this.profilesService.followProfile(
      currentUserId,
      profileUsername,
    );
    return this.profilesService.buildProfileResponse(followed);
  }

  @Delete(`:username/follow`)
  @UseGuards(AuthGuard)
  async unfollowProfile(
    @CurrentUser('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseInterface> {
    const unfollowed = await this.profilesService.unfollowProfile(
      currentUserId,
      profileUsername,
    );

    return this.profilesService.buildProfileResponse(unfollowed);
  }
}
