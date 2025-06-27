import {
  CreateMessageDto,
  GetConversationsQueryDto,
  GetMessagesQueryDto,
  UpdateMessageDto,
} from '@app/common/dtos/conversations';
import { sendWithTimeout, toPlain } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConversationsService implements OnModuleInit {
  constructor(
    @Inject('CONVERSATIONS_SERVICE')
    private readonly conversationsClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'create-message',
      'get-messages-of-conversation',
      'get-conversation-with-target-user',
      'update-message',
      'delete-message',
      'get-conversations',
    ];

    patterns.forEach((pattern) =>
      this.conversationsClient.subscribeToResponseOf(pattern),
    );
  }

  public createMessage = async (
    email: string,
    createMessageDto: CreateMessageDto,
  ) => {
    return sendWithTimeout(this.conversationsClient, 'create-message', {
      email,
      createMessageDto: toPlain(createMessageDto),
    });
  };

  public getConversationWithTargetUser = async (
    targetUserId: string,
    email: string,
  ) => {
    return sendWithTimeout(
      this.conversationsClient,
      'get-conversation-with-target-user',
      {
        targetUserId,
        email,
      },
    );
  };

  public getMessagesOfConversation = async (
    email: string,
    conversationId: string,
    getMessagesQueryDto?: GetMessagesQueryDto,
  ) => {
    return sendWithTimeout(
      this.conversationsClient,
      'get-messages-of-conversation',
      {
        email,
        conversationId,
        getMessagesQueryDto: toPlain(getMessagesQueryDto),
      },
    );
  };

  public updateMessage = async (
    conversationId: string,
    messageId: string,
    updateMessageDto: UpdateMessageDto,
    email: string,
  ) => {
    return sendWithTimeout(this.conversationsClient, 'update-message', {
      conversationId,
      messageId,
      updateMessageDto: toPlain(updateMessageDto),
      email,
    });
  };

  public deleteMessage = async (
    conversationId: string,
    messageId: string,
    email: string,
  ) => {
    return sendWithTimeout(this.conversationsClient, 'delete-message', {
      conversationId,
      messageId,
      email,
    });
  };

  public getConversations = async (
    email: string,
    getConversationsQueryDto?: GetConversationsQueryDto,
  ) => {
    return sendWithTimeout(this.conversationsClient, 'get-conversations', {
      email,
      getConversationsQueryDto: toPlain(getConversationsQueryDto),
    });
  };
}
