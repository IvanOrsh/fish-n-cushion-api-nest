import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Artilce } from './entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artilce])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
