import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
  Patch,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { ArticlesService } from './articles.service';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/user.decorator';
import { CreateArticleDto } from './dto/create-article.dto';
import { User } from '../users/entities/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { DeleteResult } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async createArtile(
    @CurrentUser() currentUser: User,
    @Body('article') body: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articlesService.createArticle(currentUser, body);
    return this.articlesService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticle(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articlesService.findOne(slug);

    if (!article) {
      throw new HttpException(
        `Article with the slug ${slug} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.articlesService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @CurrentUser('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<DeleteResult> {
    return await this.articlesService.remove(currentUserId, slug);
  }

  @Patch(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(
    @CurrentUser('id') currentUserId: number,
    @Param('slug') slug: string,
    @Body('article') body: UpdateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articlesService.update(
      currentUserId,
      slug,
      body,
    );
    return this.articlesService.buildArticleResponse(article);
  }
}
