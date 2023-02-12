import { Injectable } from '@nestjs/common';

@Injectable()
export class TagsService {
  findAll() {
    return ['fish', 'cushion', 'pin', 'chip'];
  }
}
