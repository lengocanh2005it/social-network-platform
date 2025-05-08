import {
  BadRequestException,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AuthGuard } from 'nest-keycloak-connect';

@Injectable()
export class JwtGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
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
