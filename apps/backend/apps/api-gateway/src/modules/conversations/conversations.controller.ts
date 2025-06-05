import {
  CreateMessageDto,
  GetMessagesQueryDto,
  UpdateMessageDto,
} from '@app/common/dtos/conversations';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleEnum } from '@repo/db';
import { KeycloakUser, Roles } from 'nest-keycloak-connect';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('messages')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async createMessage(
    @Body() createMesageDto: CreateMessageDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.conversationsService.createMessage(email, createMesageDto);
  }

  @Get('/with/:targetUserId')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getConversationWithTargetUser(
    @Param('targetUserId', ParseUUIDPipe) targetUserId: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.conversationsService.getConversationWithTargetUser(
      targetUserId,
      email,
    );
  }

  @Get(':id/messages')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getMessagesOfConversation(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @KeycloakUser() user: any,
    @Query() getMessagesQueryDto?: GetMessagesQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.conversationsService.getMessagesOfConversation(
      email,
      conversationId,
      getMessagesQueryDto,
    );
  }

  @Patch(':id/messages/:messageId')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async updateMessage(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @KeycloakUser() user: any,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.conversationsService.updateMessage(
      conversationId,
      messageId,
      updateMessageDto,
      email,
    );
  }

  @Delete(':id/messages/:messageId')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async deleteMessageOfConversation(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.conversationsService.deleteMessage(
      conversationId,
      messageId,
      email,
    );
  }
}
