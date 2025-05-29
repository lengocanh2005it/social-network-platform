import {
  CreateFriendRequestDto,
  ResponseFriendRequestDto,
} from '@app/common/dtos/friends';
import {
  Body,
  Controller,
  Delete,
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
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.user)
  async createFriendRequest(
    @Body() createFriendRequestDto: CreateFriendRequestDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.friendsService.createFriendRequest(
      email,
      createFriendRequestDto,
    );
  }

  @Patch()
  @Roles(RoleEnum.admin, RoleEnum.user)
  async respondToFriendRequest(
    @KeycloakUser() user: any,
    @Body() responseFriendRequestDto: ResponseFriendRequestDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.friendsService.responseFriendRequest(
      email,
      responseFriendRequestDto,
    );
  }

  @Delete()
  @Roles(RoleEnum.admin, RoleEnum.user)
  async deleteFriendRequest(
    @KeycloakUser() user: any,
    @Query('targetId') target_id: string,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.friendsService.deleteFriendRequest(email, target_id);
  }
}
