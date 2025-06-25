import {
  CreateMessageDto,
  GetConversationsQueryDto,
  GetMessagesQueryDto,
  UpdateMessageDto,
} from '@app/common/dtos/conversations';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversationsService } from './conversations.service';

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessagePattern('create-message')
  async createMessage(
    @Payload('email') email: string,
    @Payload('createMessageDto')
    createMessageDto: CreateMessageDto,
  ) {
    return this.conversationsService.createMessage(email, createMessageDto);
  }

  @MessagePattern('get-conversation-with-target-user')
  async getConversationWithTargetUser(
    @Payload('targetUserId') targetUserId: string,
    @Payload('email') email: string,
  ) {
    return this.conversationsService.getConversationWithTargetUser(
      targetUserId,
      email,
    );
  }

  @MessagePattern('get-messages-of-conversation')
  async getMessagesOfConversation(
    @Payload('email') email: string,
    @Payload('conversationId') conversationId: string,
    @Payload('getMessagesQueryDto') getMessagesQueryDto?: GetMessagesQueryDto,
  ) {
    return this.conversationsService.getMessagesOfConversation(
      email,
      conversationId,
      getMessagesQueryDto,
    );
  }

  @MessagePattern('update-message')
  async updateMessage(
    @Payload('conversationId') conversationId: string,
    @Payload('messageId') messageId: string,
    @Payload('updateMessageDto') updateMessageDto: UpdateMessageDto,
    @Payload('email') email: string,
  ) {
    return this.conversationsService.updateMessage(
      conversationId,
      messageId,
      updateMessageDto,
      email,
    );
  }

  @MessagePattern('delete-message')
  async deleteMessage(
    @Payload('conversationId') conversationId: string,
    @Payload('messageId') messageId: string,
    @Payload('email') email: string,
  ) {
    return this.conversationsService.deleteMessage(
      conversationId,
      messageId,
      email,
    );
  }

  @MessagePattern('get-conversations')
  async getConversations(
    @Payload('email') email: string,
    @Payload('getConversationsQueryDto')
    getConversationsQueryDto?: GetConversationsQueryDto,
  ) {
    return this.conversationsService.getConversations(
      email,
      getConversationsQueryDto,
    );
  }
}
