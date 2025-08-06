import { SKIP_USER_ACTIVITY_KEY } from '@app/common/decorators';
import { UpdateUserSessionDto } from '@app/common/dtos/users';
import { sendWithTimeout } from '@app/common/utils';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientKafka } from '@nestjs/microservices';
import { SessionStatusEnum } from '@repo/db';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientKafka,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const shouldSkip = this.reflector.get<boolean>(
      SKIP_USER_ACTIVITY_KEY,
      context.getHandler(),
    );

    if (shouldSkip) return next.handle();

    this.usersClient.subscribeToResponseOf('get-user-by-field');

    return next.handle().pipe(
      tap(async () => {
        if (request?.user) {
          const { email } = request.user;
          const fingerPrint = request.headers['x-fingerprint'] as string;

          const findUser = await sendWithTimeout(
            this.usersClient,
            'get-user-by-field',
            JSON.stringify({ field: 'email', value: email }),
          );

          if (fingerPrint?.trim()) {
            const updateUserSessionDto: UpdateUserSessionDto = {
              user_id: findUser.id,
              finger_print: fingerPrint,
              status: SessionStatusEnum.active,
              is_online: true,
              last_seen_at: new Date(),
            };

            this.usersClient.emit(
              'update-user-session',
              JSON.stringify(updateUserSessionDto),
            );
          }
        }
      }),
    );
  }
}
