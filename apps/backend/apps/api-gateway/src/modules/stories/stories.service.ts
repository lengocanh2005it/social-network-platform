import {
  CreateStoryDto,
  GetStoryQueryDto,
  GetStoryViewersQueryDto,
} from '@app/common/dtos/stories';
import { sendWithTimeout, toPlain } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class StoriesService implements OnModuleInit {
  constructor(
    @Inject('STORIES_SERVICE') private readonly storiesClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'create-story',
      'get-stories',
      'get-viewers-of-story',
      'delete-story',
      'get-story',
    ];

    patterns.forEach((pattern) =>
      this.storiesClient.subscribeToResponseOf(pattern),
    );
  }

  public createStory = async (
    email: string,
    createStoryDto: CreateStoryDto,
  ) => {
    return sendWithTimeout(this.storiesClient, 'create-story', {
      email,
      createStoryDto: toPlain(createStoryDto),
    });
  };

  public getStories = async (
    email: string,
    getStoryQueryDto?: GetStoryQueryDto,
  ) => {
    return sendWithTimeout(this.storiesClient, 'get-stories', {
      email,
      getStoryQueryDto: toPlain(getStoryQueryDto),
    });
  };

  public getViewersOfStory = async (
    email: string,
    storyId: string,
    getStoryViewersQueryDto?: GetStoryViewersQueryDto,
  ) => {
    return sendWithTimeout(this.storiesClient, 'get-viewers-of-story', {
      email,
      storyId,
      getStoryViewersQueryDto: toPlain(getStoryViewersQueryDto),
    });
  };

  public deleteStory = async (storyId: string, email: string) => {
    return sendWithTimeout(this.storiesClient, 'delete-story', {
      storyId,
      email,
    });
  };

  public getStory = async (storyId: string, email: string) => {
    return sendWithTimeout(this.storiesClient, 'get-story', {
      storyId,
      email,
    });
  };
}
