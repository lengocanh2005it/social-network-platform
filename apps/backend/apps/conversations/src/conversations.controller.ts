import { Controller, Get } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  getHello(): string {
    return this.conversationsService.getHello();
  }
}
