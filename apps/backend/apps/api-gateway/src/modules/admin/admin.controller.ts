import {
  GetActivitiesQueryDto,
  GetUsersQueryDto,
} from '@app/common/dtos/admin';
import { Controller, Get, Query } from '@nestjs/common';
import { RoleEnum } from '@repo/db';
import { Roles } from 'nest-keycloak-connect';
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
}
