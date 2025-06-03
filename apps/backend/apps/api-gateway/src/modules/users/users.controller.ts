import { GetPostQueryDto } from '@app/common/dtos/posts';
import {
  GetBlockedUsersListQueryDto,
  GetUserQueryDto,
  SearchUserQueryDto,
  UpdateUserProfileDto,
} from '@app/common/dtos/users';
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
  Query,
} from '@nestjs/common';
import { RoleEnum } from '@repo/db';
import { KeycloakUser, Roles } from 'nest-keycloak-connect';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getMe(
    @KeycloakUser() user: any,
    @Query() getUserQueryDto: GetUserQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.getMe(email, getUserQueryDto);
  }

  @Get('/usernames/:username')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getProfile(
    @KeycloakUser() user: any,
    @Query() getUserQueryDto: GetUserQueryDto,
    @Param('username') username: string,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.getProfile(username, email, getUserQueryDto);
  }

  @Patch('me')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async updateUserProfile(
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.updateUserProfile(updateUserProfileDto, email);
  }

  @Get('feed')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getFeed(
    @Query('getPostQueryDto') getPostQueryDto: GetPostQueryDto,
    @Query('username') username: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.getFeed(getPostQueryDto, username, email);
  }

  @Delete('blocks/:targetId')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async blockUser(
    @Param('targetId', ParseUUIDPipe) targetId: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.blockUser(targetId, email);
  }

  @Get('me/blocked')
  @Roles(RoleEnum.admin, RoleEnum.user)
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getBlockedUsersList(
    @KeycloakUser() user: any,
    @Query() getBlockedUsersListQueryDto?: GetBlockedUsersListQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.getBlockedUsersList(
      email,
      getBlockedUsersListQueryDto,
    );
  }

  @Delete('me/blocked/:targetId')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async unblockUser(
    @Param('targetId', ParseUUIDPipe) targetId: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.unblockUser(email, targetId);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getUsers(
    @KeycloakUser() user: any,
    @Query() searchUserQueryDto: SearchUserQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.getUsers(email, searchUserQueryDto);
  }
}
