import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Artilce } from './entities/article.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artilce, User])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
