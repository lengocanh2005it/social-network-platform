import {
  CreateActivityDto,
  GetActivitiesQueryDto,
} from '@app/common/dtos/admin';
import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AdminService } from './admin.service';

@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @MessagePattern('get-stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @MessagePattern('get-activities')
  async getActivities(@Payload() getActivitiesQueryDto: GetActivitiesQueryDto) {
    return this.adminService.getActivities(getActivitiesQueryDto);
  }

  @EventPattern('create-activity')
  async createActivity(
    @Payload('userId', ParseUUIDPipe) userId: string,
    @Payload('createActivityDto') createActivityDto: CreateActivityDto,
  ) {
    return this.adminService.createActivity(createActivityDto, userId);
  }

  @MessagePattern('get-growth-overview')
  async getGrowthOverview() {
    return this.adminService.getGrowthOverview();
  }
}
