import {
  Get,
  Post,
  Body,
  Controller,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Patch,
  Put,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { UsersService } from './users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Serialize } from '../common/interceptors/serialize-interceptor';
import { UserResponseDto } from './dto/userResponse.dto';
import { CurrentUser } from './decorators/user.decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

/*auth logic to be extracted in a separate module/service*/

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
  @UseGuards(AuthGuard)
  async currentUser(@CurrentUser() user: User): Promise<UserResponseInterface> {
    return this.usersService.buildUserResponse(user);
  }

  @Patch('user')
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @CurrentUser() user: User,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    const updatedUser = await this.usersService.update(user, body);
    return this.usersService.buildUserResponse(updatedUser);
  }
}
