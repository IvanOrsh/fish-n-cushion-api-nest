import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
    article.slug = 'testing';

    return await this.articlesRepository.save(article);
  }
}
