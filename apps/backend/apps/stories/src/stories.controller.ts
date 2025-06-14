import {
  CreateStoryDto,
  GetStoryQueryDto,
  GetStoryViewersQueryDto,
} from '@app/common/dtos/stories';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StoriesService } from './stories.service';

@Controller()
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @MessagePattern('create-story')
  async createStory(
    @Payload('email') email: string,
    @Payload('createStoryDto') createStoryDto: CreateStoryDto,
  ) {
    return this.storiesService.createStory(email, createStoryDto);
  }

  @MessagePattern('get-stories')
  async getStories(
    @Payload('email') email: string,
    @Payload('getStoryQueryDto') getStoryQueryDto?: GetStoryQueryDto,
  ) {
    return this.storiesService.getStories(email, getStoryQueryDto);
  }

  @MessagePattern('get-viewers-of-story')
  async getViewersOfStory(
    @Payload('email') email: string,
    @Payload('storyId') storyId: string,
    @Payload('getStoryViewersQueryDto')
    getStoryViewersQueryDto?: GetStoryViewersQueryDto,
  ) {
    return this.storiesService.getViewersOfStory(
      email,
      storyId,
      getStoryViewersQueryDto,
    );
  }

  @MessagePattern('delete-story')
  async deleteStory(
    @Payload('storyId') storyId: string,
    @Payload('email') email: string,
  ) {
    return this.storiesService.deleteStory(storyId, email);
  }

  @MessagePattern('get-story')
  async getStory(
    @Payload('storyId') storyId: string,
    @Payload('email') email: string,
  ) {
    return this.storiesService.getStory(storyId, email);
  }
}
