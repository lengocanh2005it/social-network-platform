import {
  CreateStoryDto,
  GetStoryQueryDto,
  GetStoryViewersQueryDto,
} from '@app/common/dtos/stories';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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
    return firstValueFrom(
      this.storiesClient.send('create-story', {
        email,
        createStoryDto,
      }),
    );
  };

  public getStories = async (
    email: string,
    getStoryQueryDto?: GetStoryQueryDto,
  ) => {
    return firstValueFrom(
      this.storiesClient.send('get-stories', {
        email,
        getStoryQueryDto,
      }),
    );
  };

  public getViewersOfStory = async (
    email: string,
    storyId: string,
    getStoryViewersQueryDto?: GetStoryViewersQueryDto,
  ) => {
    return firstValueFrom(
      this.storiesClient.send('get-viewers-of-story', {
        email,
        storyId,
        getStoryViewersQueryDto,
      }),
    );
  };

  public deleteStory = async (storyId: string, email: string) => {
    return firstValueFrom(
      this.storiesClient.send('delete-story', {
        storyId,
        email,
      }),
    );
  };

  public getStory = async (storyId: string, email: string) => {
    return firstValueFrom(
      this.storiesClient.send('get-story', {
        storyId,
        email,
      }),
    );
  };
}
