import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AttachAuthMiddleware implements NestMiddleware {
  constructor() {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.access_token;

    if (token && !req.header['authorization'])
      req.headers['authorization'] = `Bearer ${token}`;

    next();
  }
}
