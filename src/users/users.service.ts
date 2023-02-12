import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async createUser() {
    return 'new user';
  }
}
