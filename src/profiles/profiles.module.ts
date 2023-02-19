import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { User } from '../users/entities/user.entity';
import { Follow } from './entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
