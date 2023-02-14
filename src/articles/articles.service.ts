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
import { Article } from './entities/article.entity';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  async findOne(slug: string): Promise<Article> {
    return await this.articlesRepository.findOneBy({ slug });
  }

  // TODO: this monstrosity must be refactored
  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = await this.articlesRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .orderBy('articles.createdAt', 'DESC');

    //--------------
    // legal queries: tag, author
    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.usersRepository.findOne({
        where: {
          username: query.author,
        },
      });
      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }
    //--------------

    const articlesCount = await queryBuilder.getCount();

    //--------------
    // pagination
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }
    //--------------

    const articles = await queryBuilder.getMany();
    return {
      articles,
      articlesCount,
    };
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

  async update(
    currentUserId: number,
    slug: string,
    attrs: Partial<Article>,
  ): Promise<Article> {
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

    if (attrs.title && attrs.title !== article.title) {
      article.slug = this.getSlug(attrs.title);
    }

    Object.assign(article, attrs);

    return this.articlesRepository.save(article);
  }

  async addArticleToFavorites(slug: string, userId: number): Promise<Article> {
    const article = await this.findOne(slug);

    if (!article) {
      throw new HttpException(
        `Article with the slug ${slug} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }

    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['favorites'],
    });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.usersRepository.save(user);
      await this.articlesRepository.save(article);
    }

    return article;
  }

  buildArticleResponse(article: Article) {
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
