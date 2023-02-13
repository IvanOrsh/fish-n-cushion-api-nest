import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction, request } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from 'src/config';

import { ExpressRequest } from '../types/expressRequest.interface';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly usersServide: UsersService) {}

  async use(
    req: ExpressRequest,
    _: Response,
    next: NextFunction,
  ): Promise<void> {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return; // just to be safe
    }

    const [word, token] = req.headers.authorization.split(' ');

    try {
      const decode = verify(token, JWT_SECRET) as User;
      const user = await this.usersServide.findById(decode.id);
      req.user = user;
    } catch (err) {
      req.user = null;
    } finally {
      next();
    }
  }
}
