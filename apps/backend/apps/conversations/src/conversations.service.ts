import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationsService {
  getHello(): string {
    return 'Hello World!';
  }
}
