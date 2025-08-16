import {
  GetActivitiesQueryDto,
  GetPostsQueryDto,
  GetReportersOfReportQueryDto,
  GetReportsQueryDto,
  GetSharePostsQueryDto,
  GetStoriesQueryDto,
  GetUsersQueryDto,
  UpdatePostStatusDto,
  UpdateReportStatusDto,
  UpdateStoryStatusDto,
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

  @Get('posts')
  async getPosts(
    @Query() getPostsQueryDto: GetPostsQueryDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.adminService.getPosts(getPostsQueryDto, email);
  }

  @Patch('posts/:postId/status')
  async updatePostStatus(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() updatePostStatusDto: UpdatePostStatusDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    const { is_active, reason } = updatePostStatusDto;

    if (is_active === true && reason)
      throw new HttpException(
        'Reason must not be provided when the post is active.',
        HttpStatus.BAD_REQUEST,
      );

    return this.adminService.updatePostStatus(
      postId,
      updatePostStatusDto,
      email,
    );
  }

  @Get('posts/:postId/shares')
  async getSharesOfPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() getSharePostsQueryDto: GetSharePostsQueryDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.adminService.getSharesOfPost(
      postId,
      getSharePostsQueryDto,
      email,
    );
  }

  @Get('stories')
  async getStories(
    @Query() getStoriesQueryDto: GetStoriesQueryDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.adminService.getStories(getStoriesQueryDto, email);
  }

  @Patch('stories/:storyId/status')
  async updateStoryStatus(
    @Param('storyId', ParseUUIDPipe) storyId: string,
    @Body() updateStoryStatusDto: UpdateStoryStatusDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.adminService.updateStoryStatus(
      storyId,
      updateStoryStatusDto,
      email,
    );
  }

  @Get('reports')
  async getReports(
    @Query() getReportsQueryDto: GetReportsQueryDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.adminService.getReports(getReportsQueryDto, email);
  }

  @Get('reports/:targetId/reporters')
  async getReportersOfReport(
    @Query() getRepotersOfReportQueryDto: GetReportersOfReportQueryDto,
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    return this.adminService.getReportersOfReport(
      getRepotersOfReportQueryDto,
      targetId,
    );
  }

  @Patch('reports/:reportId/status')
  async updateReportStatus(
    @Body() updateReportStatusDto: UpdateReportStatusDto,
    @Param('reportId', ParseUUIDPipe) reportId: string,
  ) {
    return this.adminService.updateReportStatus(
      updateReportStatusDto,
      reportId,
    );
  }
}
