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
import { Follow } from '../profiles/entities/follow.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
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
    // legal queries: tag, author, favorite
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

    if (query.favorited) {
      const author = await this.usersRepository.findOne({
        where: {
          username: query.favorited,
        },
        relations: ['favorites'],
      });
      const ids = author.favorites.map((el) => el.id);

      if (ids.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
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

    //--------------
    // adding favorite field
    let favoritedIds: number[] = [];
    if (currentUserId) {
      const currentUser = await this.usersRepository.findOne({
        where: {
          id: currentUserId,
        },
        relations: ['favorites'],
      });
      favoritedIds = currentUser.favorites.map((favorite) => favorite.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorited = articles.map((article) => {
      const favorited = favoritedIds.includes(article.id);
      return { ...article, favorited };
    });
    return {
      articles: articlesWithFavorited,
      articlesCount,
    };
  }

  async getFeed(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const follows = await this.followsRepository.find({
      where: {
        followerId: currentUserId,
      },
    });

    if (follows.length === 0) {
      return {
        articles: [],
        articlesCount: 0,
      };
    }

    const followingsUserIds = follows.map((follow) => follow.followingId);
    const queryBuilder = await this.articlesRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingsUserIds })
      .orderBy('articles.createdAt', 'DESC');

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

  //TODO: to be refactored
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

  //TODO: to be refactored
  async deleteArticleFromFavorites(
    slug: string,
    userId: number,
  ): Promise<Article> {
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

    const articleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
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
