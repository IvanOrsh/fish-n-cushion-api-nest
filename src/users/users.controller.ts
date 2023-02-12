import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags()
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('users')
  async createUser(): Promise<any> {
    return await this.usersService.createUser();
  }
}
