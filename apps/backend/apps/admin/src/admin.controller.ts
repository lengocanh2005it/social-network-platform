import {
  CreateActivityDto,
  GetActivitiesQueryDto,
  GetPostsQueryDto,
  GetReportersOfReportQueryDto,
  GetReportsQueryDto,
  GetSharePostsQueryDto,
  GetStoriesQueryDto,
  GetUsersQueryDto,
  UpdatePostStatusDto,
  UpdateStoryStatusDto,
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

  @MessagePattern('get-users-dashboard')
  async getUsers(@Payload() getUsersQueryDto: GetUsersQueryDto) {
    return this.adminService.getUsers(getUsersQueryDto);
  }

  @MessagePattern('get-posts-dashboard')
  async getPosts(
    @Payload('getPostsQueryDto') getPostsQueryDto: GetPostsQueryDto,
    @Payload('email') email: string,
  ) {
    return this.adminService.getPosts(getPostsQueryDto, email);
  }

  @MessagePattern('update-post-status')
  async updatePostStatus(
    @Payload('postId') postId: string,
    @Payload('updatePostStatusDto') updatePostStatusDto: UpdatePostStatusDto,
    @Payload('email') email: string,
  ) {
    return this.adminService.updatePostStatus(
      postId,
      updatePostStatusDto,
      email,
    );
  }

  @MessagePattern('get-shares-of-post')
  async getSharesOfPost(
    @Payload('postId') postId: string,
    @Payload('getSharePostsQueryDto')
    getSharePostsQueryDto: GetSharePostsQueryDto,
    @Payload('email') email: string,
  ) {
    return this.adminService.getSharesOfPost(
      postId,
      getSharePostsQueryDto,
      email,
    );
  }

  @MessagePattern('get-stories-dashboard')
  async getStories(
    @Payload('getStoriesQueryDto') getStoriesQueryDto: GetStoriesQueryDto,
    @Payload('email') email: string,
  ) {
    return this.adminService.getStories(getStoriesQueryDto, email);
  }

  @MessagePattern('update-story-status')
  async updateStoryStatus(
    @Payload('storyId', ParseUUIDPipe) storyId: string,
    @Payload('updateStoryStatusDto') updateStoryStatusDto: UpdateStoryStatusDto,
    @Payload('email') email: string,
  ) {
    return this.adminService.updateStoryStatus(
      storyId,
      updateStoryStatusDto,
      email,
    );
  }

  @MessagePattern('get-reports')
  async getReports(
    @Payload('getReportsQueryDto') getReportsQueryDto: GetReportsQueryDto,
    @Payload('email') email: string,
  ) {
    return this.adminService.getReports(getReportsQueryDto, email);
  }

  @MessagePattern('get-reporters-of-report')
  async getReportersOfReport(
    @Payload('getReportersOfReportQueryDto')
    getReportersOfReportQueryDto: GetReportersOfReportQueryDto,
    @Payload('targetId', ParseUUIDPipe) targetId: string,
  ) {
    return this.adminService.getReportersOfReport(
      getReportersOfReportQueryDto,
      targetId,
    );
  }
}
