import { GetUserQueryDto, UpdateUserProfileDto } from '@app/common/dtos/users';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
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
    @Query() getUserQueryDto?: GetUserQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.usersService.getMe(email, getUserQueryDto);
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
}
