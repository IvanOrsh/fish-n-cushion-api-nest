import { Article } from '../entities/article.entity';

export type ArticleType = Omit<Article, 'updateTimestamp'>;
