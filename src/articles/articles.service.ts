import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import slugify from 'slugify';

import { User } from '../users/entities/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { Artilce } from './entities/article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Artilce)
    private readonly articlesRepository: Repository<Artilce>,
  ) {}

  async createArticle(currentUser: User, body: CreateArticleDto) {
    const article = await this.articlesRepository.create(body);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.author = currentUser;
    article.slug = this.getSlug(body.title);

    return await this.articlesRepository.save(article);
  }

  async findOne(slug: string): Promise<Artilce> {
    return await this.articlesRepository.findOneBy({ slug });
  }

  async remove(currentUserId: number, slug: string): Promise<DeleteResult> {
    const article = await this.findOne(slug);

    if (!article) {
      throw new HttpException(
        `Article with the slug ${slug} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException(
        `You are not an author of this article`,
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.articlesRepository.delete({ slug });
  }

  buildArticleResponse(article: Artilce) {
    return {
      article,
    };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
