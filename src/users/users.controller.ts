import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@ApiTags()
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('users')
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<any> {
    console.log('createUser', createUserDto);
    return await this.usersService.createUser(createUserDto);
  }
}
