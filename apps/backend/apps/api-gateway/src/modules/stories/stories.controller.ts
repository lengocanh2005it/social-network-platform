import {
  CreateStoryDto,
  GetStoryQueryDto,
  GetStoryViewersQueryDto,
} from '@app/common/dtos/stories';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { RoleEnum } from '@repo/db';
import { KeycloakUser, Roles } from 'nest-keycloak-connect';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.user)
  async createStory(
    @KeycloakUser() user: any,
    @Body() createStoryDto: CreateStoryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.storiesService.createStory(email, createStoryDto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getStories(
    @KeycloakUser() user: any,
    @Query() getStoryQueryDto?: GetStoryQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.storiesService.getStories(email, getStoryQueryDto);
  }

  @Get(':id/viewers')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getViewersOfStory(
    @KeycloakUser() user: any,
    @Param('id', ParseUUIDPipe) storyId: string,
    @Query() getStoryViewersQueryDto?: GetStoryViewersQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.storiesService.getViewersOfStory(
      email,
      storyId,
      getStoryViewersQueryDto,
    );
  }

  @Delete(':id')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async deleteStory(
    @KeycloakUser() user: any,
    @Param('id', ParseUUIDPipe) storyId: string,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.storiesService.deleteStory(storyId, email);
  }
}
