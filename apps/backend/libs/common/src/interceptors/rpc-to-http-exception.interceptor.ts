import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class RpcToHttpExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (
          typeof err === 'object' &&
          err !== null &&
          'statusCode' in err &&
          'message' in err
        ) {
          const { message, statusCode } = err as {
            message: string | string[];
            statusCode: number;
          };

          const status = statusCode ?? 500;

          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: status,
                  message,
                  error: HttpStatus[status],
                },
                status,
              ),
          );
        }

        return throwError(() => err);
      }),
    );
  }
}
