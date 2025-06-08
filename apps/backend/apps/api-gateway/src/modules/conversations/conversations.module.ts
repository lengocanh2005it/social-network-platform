import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { ConversationGateway } from './conversations.gateway';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  providers: [ConversationsService, ConversationGateway],
  controllers: [ConversationsController],
})
export class ConversationsModule {}
