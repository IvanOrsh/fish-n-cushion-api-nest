import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticlesService {
  async createArticle() {
    return 'ArticlesService -> crateArtilce()';
  }
}
