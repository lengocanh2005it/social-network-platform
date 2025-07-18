import { KeycloakProvider } from '@app/common/providers';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly keycloakProvider: KeycloakProvider) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<any>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[] = 'Unexpected error';
    let error: string | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const res = exceptionResponse as any;
      message = res.message ?? message;
      error = res.error;
    }

    let email: string | undefined;

    const token = request.cookies?.access_token;
    if (token) {
      try {
        const decoded: any = await this.keycloakProvider.verifyToken(token);
        email = decoded?.email;
      } catch (e) {
        console.warn('Failed to decode token from cookie', e);
      }
    }

    Sentry.captureException(exception, {
      extra: {
        message,
        error,
        path: request.url,
        method: request.method,
        statusCode: status,
        ...(request.body &&
          Object.keys(request.body).length > 0 && { body: request.body }),
        ...(email && { email }),
      },
    });

    response.status(status).json({
      statusCode: status,
      path: request.url,
      message,
      ...(error && { error }),
    });
  }
}
