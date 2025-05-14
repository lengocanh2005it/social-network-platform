import { HttpException } from '@nestjs/common';

export class AppHttpException extends HttpException {
  constructor(message: string, statusCode: number) {
    super({ message, statusCode }, statusCode);
  }
}
