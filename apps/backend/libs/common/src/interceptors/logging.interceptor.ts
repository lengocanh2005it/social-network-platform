import { appLogger } from '@app/common/utils';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Request } from 'express';
import { Counter } from 'prom-client';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('gateway_requests_total')
    private readonly requestsCounter: Counter,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.requestsCounter.inc();

    const req = context.switchToHttp().getRequest<Request>();

    const method = req.method;
    const url = req.originalUrl;

    appLogger.info(`Incoming request: ${method} ${url}`);

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        appLogger.info(`Request handled: ${method} ${url} - ${duration}ms`);
      }),
      catchError((err) => {
        const duration = Date.now() - now;
        appLogger.error(
          `Request failed: ${method} ${url} - ${duration}ms\n${err.stack || err}`,
        );
        throw err;
      }),
    );
  }
}
