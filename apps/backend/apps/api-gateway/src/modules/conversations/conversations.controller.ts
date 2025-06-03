import { Body, Controller, Post } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { KeycloakUser, Roles } from 'nest-keycloak-connect';
import { RoleEnum } from '@repo/db';
import { CreateConversationDto } from '@app/common/dtos/conversations';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.user)
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @KeycloakUser() user: any,
  ) {}
}
