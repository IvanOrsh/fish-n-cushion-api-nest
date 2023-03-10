import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JWT_SECRET } from '../config';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const userByEmailOrUsername = await this.usersRepository.findOne({
      where: [
        {
          email: createUserDto.email,
        },
        {
          username: createUserDto.username,
        },
      ],
    });

    if (userByEmailOrUsername) {
      throw new HttpException(
        `Email or username are taken`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = await this.usersRepository.create(createUserDto);

    return await this.usersRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    return await this.usersRepository.findOneBy({ id });
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const userByEmail = await this.usersRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
      select: ['id', 'username', 'email', 'bio', 'image', 'password'],
    });

    if (!userByEmail) {
      throw new HttpException(
        `${loginUserDto.email} not found`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await compare(
      loginUserDto.password,
      userByEmail.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        `Password is not valid`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // delete userByEmail.password;

    return userByEmail;
  }

  async update(user: User, attrs: Partial<User>): Promise<User> {
    /*TODO: extract this monstrosity*/
    if (
      (attrs.username || attrs.email) &&
      (user.username !== attrs.username || user.email !== attrs.email)
    ) {
      const email = user.email !== attrs.email ? { email: attrs.email } : null;
      const username =
        user.username !== attrs.username ? { username: attrs.username } : null;
      const searchQuery = {
        where: [email, username],
      };
      const userByEmailOrUsername = await this.usersRepository.findOne(
        searchQuery,
      );

      if (userByEmailOrUsername) {
        throw new HttpException(
          `Email or username are taken`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
    Object.assign(user, attrs);
    return await this.usersRepository.save(user);
  }

  private generateJwt(user: User): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }

  buildUserResponse(user: User): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }
}
