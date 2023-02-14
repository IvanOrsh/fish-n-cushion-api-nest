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
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';

import { ArticlesService } from './articles.service';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async findAll(
    @CurrentUser('id') currentUserId: number,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return await this.articlesService.findAll(currentUserId, query);
  }

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
