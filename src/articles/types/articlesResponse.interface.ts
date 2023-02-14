import { Article } from '../entities/article.entity';

export interface ArticlesResponseInterface {
  articles: Article[];
  articlesCount: number;
}
