import { GetPostQueryDto } from '@app/common/dtos/posts';
import {
  GetBlockedUsersListQueryDto,
  GetPhotosOfUserQueryDto,
  GetUserQueryDto,
  SearchUserQueryDto,
  UpdateThemeDto,
  UpdateUserProfileDto,
} from '@app/common/dtos/users';
import { clearCookies } from '@app/common/utils';
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
  Req,
  Res,
} from '@nestjs/common';
import { RoleEnum } from '@repo/db';
import { Request, Response } from 'express';
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
    @Query() getPostQueryDto: GetPostQueryDto & { username: string },
    @KeycloakUser() user: any,
  ) {
    const { username, ...res } = getPostQueryDto;

    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.getFeed(res, username, email);
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

  @Get('photos')
  async getPhotosOfUser(
    @KeycloakUser() user: any,
    @Query() getPhotosOfUserQueryDto: GetPhotosOfUserQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.getPhotosOfUser(email, getPhotosOfUserQueryDto);
  }

  @Delete('me')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async deleteMyAccount(
    @KeycloakUser() user: any,
    @Res({
      passthrough: true,
    })
    res: Response,
    @Req() req: Request,
  ) {
    const refreshToken: string = req.cookies?.refresh_token;

    clearCookies(res);

    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.deleteMyAccount(email, refreshToken);
  }

  @Patch('theme')
  async updateThemeOfUser(
    @KeycloakUser() user: any,
    @Body() updateThemeDto: UpdateThemeDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.updateThemeOfUser(email, updateThemeDto);
  }
}
