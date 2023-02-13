import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artilce } from './entities/article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Artilce)
    private readonly articlesRepository: Repository<Artilce>,
  ) {}

  async createArticle() {
    return 'ArticlesService -> crateArtilce()';
  }
}
