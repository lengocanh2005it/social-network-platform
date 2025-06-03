import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

@Module({
  imports: [],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
