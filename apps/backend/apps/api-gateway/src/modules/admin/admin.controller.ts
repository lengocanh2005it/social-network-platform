import { Controller, Get } from '@nestjs/common';
import { RoleEnum } from '@repo/db';
import { Roles } from 'nest-keycloak-connect';
import { AdminService } from './admin.service';

@Controller('admin')
@Roles(RoleEnum.admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  async getStats() {
    return this.adminService.getStats();
  }
}
