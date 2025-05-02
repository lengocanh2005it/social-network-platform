import { Controller, Get, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { KeycloakUser, Roles } from 'nest-keycloak-connect';
import { UsersService } from './users.service';
import { GetUserQueryDto } from '@app/common/dtos/users';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Roles(Role.admin, Role.user)
  async getMe(
    @KeycloakUser() user: any,
    @Query() getUserQueryDto?: GetUserQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string') return;

    return this.usersService.getMe(email, getUserQueryDto);
  }
}
