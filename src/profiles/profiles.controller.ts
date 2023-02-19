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

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  @Get(':username')
  getProfile(
    @CurrentUser('id') currentUserId: number,
    @Param('username') username: string,
  ) {
    console.log(currentUserId);
    return 'it works';
  }

  @Post(`:username/follow`)
  @UseGuards(AuthGuard)
  async followUser(
    @CurrentUser('id') currentUserId: number,
    @Param('username') username: string,
  ) {
    return 'followed';
  }

  @Delete(`:username/follow`)
  @UseGuards(AuthGuard)
  async unfollowUser(
    @CurrentUser('id') currentUserId: number,
    @Param('username') username: string,
  ) {
    return 'unfollowed';
  }
}
