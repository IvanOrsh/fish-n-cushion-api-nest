import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ArticlesService } from './articles.service';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/user.decorator';
import { CreateArticleDto } from './dto/create-article.dto';
import { User } from '../users/entities/user.entity';
import { Artilce } from './entities/article.entity';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createArtile(
    @CurrentUser() currentUser: User,
    @Body('article') body: CreateArticleDto,
  ): Promise<Artilce> {
    return await this.articlesService.createArticle(currentUser, body);
  }
}
