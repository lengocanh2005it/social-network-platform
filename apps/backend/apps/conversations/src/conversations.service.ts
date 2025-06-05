import {
  CreateMessageDto,
  GetMessagesQueryDto,
  UpdateMessageDto,
} from '@app/common/dtos/conversations';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { HuggingFaceProvider } from '@app/common/providers';
import { isToxic } from '@app/common/utils';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { UsersType } from '@repo/db';
import { omit } from 'lodash';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConversationsService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientKafka,
    private readonly huggingFaceProvider: HuggingFaceProvider,
  ) {}

  onModuleInit() {
    this.usersClient.subscribeToResponseOf('get-user-by-field');
  }

  public createMessage = async (
    email: string,
    createMessageDto: CreateMessageDto,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const { target_id } = createMessageDto;

    const targetUser = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'id',
          value: target_id,
        }),
      ),
    );

    if (target_id === user.id)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You cannot send a message to yourself.`,
      });

    const { content, reply_to_message_id } = createMessageDto;

    if (reply_to_message_id) {
      const existingParentMessage =
        await this.prismaService.messages.findUnique({
          where: {
            id: reply_to_message_id,
          },
        });

      if (!existingParentMessage)
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `The message you are replying to was not found. It may have been deleted or does not exist.`,
        });
    }

    if (isToxic(await this.huggingFaceProvider.analyzeText(content)))
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `Your message contains inappropriate language and cannot be sent.`,
      });

    const [currentUserId, targetUserId] = [user.id, targetUser.id].sort(
      (a, b) => a.localeCompare(b),
    );

    const conversation = await this.prismaService.conversations.upsert({
      where: {
        user_1_id_user_2_id: {
          user_1_id: currentUserId,
          user_2_id: targetUserId,
        },
      },
      create: {
        user_1_id: currentUserId,
        user_2_id: targetUserId,
      },
      update: {},
    });

    return this.createNewMessage(createMessageDto, user.id, conversation.id);
  };

  public getConversationWithTargetUser = async (
    targetUserId: string,
    email: string,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const targetUser = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'id',
          value: targetUserId,
        }),
      ),
    );

    if (targetUserId === user.id)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You cannot start a conversation with yourself.`,
      });

    const [user_1, user_2] = [user.id, targetUser.id].sort((a, b) =>
      a.localeCompare(b),
    );

    return omit(
      await this.prismaService.conversations.upsert({
        where: {
          user_1_id_user_2_id: { user_1_id: user_1, user_2_id: user_2 },
        },
        create: {
          user_1_id: user_1,
          user_2_id: user_2,
        },
        update: {},
      }),
      ['user_1_id', 'user_2_id'],
    );
  };

  public getMessagesOfConversation = async (
    email: string,
    conversationId: string,
    getMessagesQueryDto?: GetMessagesQueryDto,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const existingConversation =
      await this.prismaService.conversations.findUnique({
        where: {
          id: conversationId,
        },
      });

    if (!existingConversation)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `We couldn't find the conversation you're looking for.`,
      });

    if (
      existingConversation.user_1_id !== user.id &&
      existingConversation.user_2_id !== user.id
    )
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You don't have permission to view this conversation.`,
      });

    const limit = getMessagesQueryDto?.limit ?? 10;

    const decodedCursor = getMessagesQueryDto?.after
      ? this.decodeCursor(getMessagesQueryDto.after)
      : null;

    const messages = await this.prismaService.messages.findMany({
      where: {
        conversation_id: conversationId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(decodedCursor && {
        cursor: {
          created_at: decodedCursor.createdAt,
          id: decodedCursor.messageId,
        },
        skip: 1,
      }),
    });

    const hasNextPage = messages?.length > limit;

    const items = hasNextPage ? messages.slice(0, -1) : messages;

    const reversedItems = items.reverse();

    const nextCursor = hasNextPage
      ? this.encodeCursor(reversedItems[0].id, reversedItems[0].created_at)
      : null;

    return {
      data: await Promise.all(
        reversedItems.map((item) =>
          this.getFormattedMessage(
            item,
            item?.reply_to_message_id ? item.reply_to_message_id : undefined,
          ),
        ),
      ),
      nextCursor,
    };
  };

  public updateMessage = async (
    conversationId: string,
    messageId: string,
    updateMessageDto: UpdateMessageDto,
    email: string,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const { message } = await this.verifyMessageOfConversation(
      conversationId,
      messageId,
      user.id,
      'edit',
    );

    const { content } = updateMessageDto;

    await this.prismaService.messages.update({
      where: {
        id: message.id,
      },
      data: {
        content,
        updated_at: new Date(),
      },
    });

    return this.getFormattedMessage(
      await this.prismaService.messages.findUnique({
        where: {
          id: message.id,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      }),
    );
  };

  public deleteMessage = async (
    conversationId: string,
    messageId: string,
    email: string,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const { message } = await this.verifyMessageOfConversation(
      conversationId,
      messageId,
      user.id,
      'delete',
    );

    await this.prismaService.messages.update({
      where: {
        id: messageId,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return this.getFormattedMessage(
      await this.prismaService.messages.findUnique({
        where: {
          id: message.id,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      }),
    );
  };

  private verifyMessageOfConversation = async (
    conversationId: string,
    messageId: string,
    user_id: string,
    action: 'edit' | 'delete',
  ) => {
    const message = await this.prismaService.messages.findUnique({
      where: {
        id: messageId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `We couldn't find the message you requested.`,
      });

    if (message?.user_id !== user_id)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You can only ${action} your own messages.`,
      });

    if (message?.deleted_at)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `This message has been deleted and cannot be ${action === 'edit' ? 'editted' : 'deleted again'}.`,
      });

    const existingConversation =
      await this.prismaService.conversations.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          messages: true,
          user_1: true,
          user_2: true,
        },
      });

    if (!existingConversation)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The conversation you're looking for could not be found.`,
      });

    if (
      existingConversation.user_1_id !== user_id &&
      existingConversation.user_2_id !== user_id
    )
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You are not a participant in this conversation.`,
      });

    if (
      !existingConversation.messages.some((message) => message.id === messageId)
    )
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `This message does not belong to the conversation.`,
      });

    return { message, existingConversation };
  };

  private createNewMessage = async (
    createMessageDto: CreateMessageDto,
    currentUserId: string,
    conversation_id: string,
  ) => {
    const { reply_to_message_id, content } = createMessageDto;

    const newMessage = await this.prismaService.messages.create({
      data: {
        user_id: currentUserId,
        conversation_id,
        content,
        ...(reply_to_message_id && { reply_to_message_id }),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    return this.getFormattedMessage(
      newMessage,
      reply_to_message_id ? reply_to_message_id : undefined,
    );
  };

  private getFormattedMessage = async (
    item: any,
    parent_message_id?: string,
  ) => {
    let parentMessage: any;

    if (parent_message_id) {
      parentMessage = await this.prismaService.messages.findUnique({
        where: {
          id: parent_message_id,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    return {
      id: item.id,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item?.deleted_at ? item.deleted_at : undefined,
      conversation_id: item.conversation_id,
      parent_message_id: item?.reply_to_message_id
        ? item.reply_to_message_id
        : undefined,
      user: {
        id: item.user.id,
        full_name: `${item.user.profile?.first_name ?? ''} ${item.user.profile?.last_name ?? ''}`,
        avatar_url: item.user.profile?.avatar_url ?? '',
        username: item.user.profile?.username ?? '',
      },
      ...(parentMessage && {
        parent_message: await this.getFormattedMessage(parentMessage),
      }),
    };
  };

  private encodeCursor = (messageId: string, createdAt: Date): string => {
    const rawCursor = `${messageId}::${createdAt.toISOString()}`;
    return Buffer.from(rawCursor).toString('base64');
  };

  private decodeCursor = (
    cursor: string,
  ): { messageId: string; createdAt: Date } => {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    const [messageId, createdAtStr] = decoded.split('::');
    return {
      messageId,
      createdAt: new Date(createdAtStr),
    };
  };
}
