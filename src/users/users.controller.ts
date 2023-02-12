import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { UsersService } from './users.service';

@ApiTags()
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.usersService.createUser(createUserDto);
    return this.usersService.buildUserResponse(user);
  }
}
