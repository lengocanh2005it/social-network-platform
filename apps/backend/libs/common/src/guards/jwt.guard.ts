import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'nest-keycloak-connect';

@Injectable()
export class JwtGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    if (req?.url === '/metrics') {
      return true;
    }

    try {
      return await super.canActivate(context);
    } catch (err) {
      console.error(err);

      throw new HttpException(
        'You are not authenticated. Please login.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
