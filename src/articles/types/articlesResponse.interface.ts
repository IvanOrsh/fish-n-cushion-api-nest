import { Artilce } from '../entities/article.entity';

export interface ArticlesResponseInterface {
  articles: Artilce[];
  articlesCount: number;
}
