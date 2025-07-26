import {
  GetActivitiesQueryDto,
  GetUsersQueryDto,
  UpdateUserSuspensionDto,
} from '@app/common/dtos/admin';
import { GetUserQueryDto } from '@app/common/dtos/users';
import {
  Body,
  Controller,
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
import { AdminService } from './admin.service';

@Controller('admin/dashboard')
@Roles(RoleEnum.admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('activities')
  async getActivities(@Query() getActivitiesQueryDto: GetActivitiesQueryDto) {
    return this.adminService.getActivities(getActivitiesQueryDto);
  }

  @Get('growth')
  async getGrowthOverview() {
    return this.adminService.getGrowthOverview();
  }

  @Get('users')
  async getUsers(@Query() getUsersQueryDto: GetUsersQueryDto) {
    return this.adminService.getUsers(getUsersQueryDto);
  }

  @Get('users/:username')
  async getUser(
    @Param('username') username: string,
    @Query() getUserQueryDto: GetUserQueryDto,
  ) {
    return this.adminService.getUser(username, getUserQueryDto);
  }

  @Patch('users/:userId/suspension')
  async updateUserSuspension(
    @Param('userId', ParseUUIDPipe) userId: string,
    @KeycloakUser() user: any,
    @Body() updateUserSuspensionDto: UpdateUserSuspensionDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.adminService.updateUserSuspension(
      userId,
      email,
      updateUserSuspensionDto,
    );
  }
}
