import {
  Get,
  Post,
  Body,
  Controller,
  UsePipes,
  ValidationPipe,
  Req,
  NotFoundException,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { UsersService } from './users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Serialize } from '../common/interceptors/serialize-interceptor';
import { UserResponseDto } from './dto/userResponse.dto';
import { ExpressRequest } from '../common/types/expressRequest.interface';

@ApiTags()
@Controller()
@Serialize(UserResponseDto)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.usersService.createUser(createUserDto);
    return this.usersService.buildUserResponse(user);
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.usersService.login(loginUserDto);
    return this.usersService.buildUserResponse(user);
  }

  @Get('user')
  async currentUser(
    @Req() request: ExpressRequest,
  ): Promise<UserResponseInterface> {
    if (!request.user) {
      throw new NotFoundException(`Not logged in`);
    }
    return this.usersService.buildUserResponse(request.user);
  }
}
