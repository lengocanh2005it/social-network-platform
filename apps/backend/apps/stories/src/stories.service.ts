import { CreateNotificationDto } from '@app/common/dtos/notifications';
import {
  CreateStoryDto,
  GetStoryQueryDto,
  GetStoryViewersQueryDto,
} from '@app/common/dtos/stories';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { generateNotificationMessage } from '@app/common/utils';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import {
  NotificationTypeEnum,
  PhotoTypeEnum,
  PostPrivaciesEnum,
  UsersType,
} from '@repo/db';
import { omit } from 'lodash';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class StoriesService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientKafka,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.usersClient.subscribeToResponseOf('get-user-by-field');
    this.usersClient.subscribeToResponseOf('get-friends');
    this.usersClient.subscribeToResponseOf('check-friendship-status');
  }

  public getStories = async (
    email: string,
    getStoryQueryDto?: GetStoryQueryDto,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const friendIds = await firstValueFrom(
      this.usersClient.send('get-friends', {
        email,
      }),
    );

    const limit = getStoryQueryDto?.limit ?? 10;

    const decodedCursor = getStoryQueryDto?.after
      ? this.decodeCursor(getStoryQueryDto.after)
      : null;

    const stories = await this.prismaService.stories.findMany({
      where: {
        user_id: {
          in: [user.id, ...friendIds],
        },
        expires_at: {
          gt: new Date(),
        },
      },
      orderBy: [
        {
          created_at: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      take: limit + 1,
      ...(decodedCursor && {
        cursor: {
          created_at: decodedCursor.createdAt,
          id: decodedCursor.storyId,
        },
      }),
    });

    const hasNextPage = stories.length > limit;

    const items = hasNextPage ? stories.slice(0, -1) : stories;

    const nextCursor = hasNextPage
      ? this.encodeCursor(
          items[items.length - 1].created_at,
          items[items.length - 1].id,
        )
      : null;

    return {
      data: await Promise.all(
        items.map((item) => this.getFormattedStory(item.id, user.id)),
      ),
      nextCursor,
    };
  };

  public createStory = async (
    email: string,
    createStoryDto: CreateStoryDto,
  ) => {
    const user = await firstValueFrom<any>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
          getUserQueryDto: {
            includeProfile: true,
          },
        }),
      ),
    );

    const existingValidStoryCount = await this.prismaService.stories.count({
      where: {
        user_id: user.id,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (existingValidStoryCount >= 5)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          'You can only post up to 5 stories per day. Please try again tomorrow.',
      });

    const { content_type, content_url, text_content, expires_at } =
      createStoryDto;

    const newStory = await this.prismaService.stories.create({
      data: {
        content_type,
        ...(content_url && { content_url }),
        ...(text_content && { text_content }),
        expires_at,
        user_id: user.id,
      },
    });

    if (content_url?.trim()) {
      this.usersClient.emit('create-photo-of-user', {
        createPhotoOfUserDto: {
          url: content_url,
          type: PhotoTypeEnum.STORY,
          metadata: {
            story_id: newStory.id,
          },
          privacy: PostPrivaciesEnum.public,
        },
        user_id: user.id,
      });
    }

    const friendIds = await firstValueFrom<string[]>(
      this.usersClient.send('get-friends', {
        email,
      }),
    );

    friendIds.forEach((friendId) => {
      const createNotificationDto: CreateNotificationDto = {
        type: NotificationTypeEnum.story_added_by_friend,
        content: generateNotificationMessage(
          NotificationTypeEnum.story_added_by_friend,
          {
            senderName: `${user.profile?.first_name ?? ''} ${user.profile?.last_name ?? ''}`,
          },
        ),
        recipient_id: friendId,
        sender_id: user.id,
        metadata: {
          story_id: newStory.id,
        },
      };

      this.notificationsClient.emit(
        'create-notification',
        createNotificationDto,
      );
    });

    return this.getFormattedStory(newStory.id, user.id);
  };

  public getViewersOfStory = async (
    email: string,
    storyId: string,
    getStoryViewersQueryDto?: GetStoryViewersQueryDto,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const story = await this.prismaService.stories.findUnique({
      where: {
        id: storyId,
      },
    });

    if (!story)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'The story you are looking for could not be found.',
      });

    if (new Date(story.expires_at).getTime() >= new Date().getTime()) {
      await this.prismaService.storyViews.upsert({
        where: {
          story_id_viewer_id: {
            story_id: storyId,
            viewer_id: user.id,
          },
        },
        create: {
          story_id: storyId,
          viewer_id: user.id,
        },
        update: {},
      });
    }

    function encodeCursor(viewer_id: string, story_id: string): string {
      const cursorStr = `${viewer_id}::${story_id}`;
      return Buffer.from(cursorStr).toString('base64');
    }

    function decodeCursor(cursor: string): {
      viewer_id: string;
      story_id: string;
    } {
      const decodedStr = Buffer.from(cursor, 'base64').toString('utf-8');
      const [viewer_id, story_id] = decodedStr.split('::');
      return { viewer_id, story_id };
    }

    const limit = getStoryViewersQueryDto?.limit ?? 10;

    const decodedCursor = getStoryViewersQueryDto?.after
      ? decodeCursor(getStoryViewersQueryDto.after)
      : null;

    const viewers = await this.prismaService.storyViews.findMany({
      where: {
        story_id: storyId,
      },
      include: {
        viewer: {
          include: {
            profile: true,
          },
        },
      },
      take: limit + 1,
      orderBy: [
        {
          viewed_at: 'desc',
        },
      ],
      ...(decodedCursor && {
        cursor: {
          story_id_viewer_id: {
            story_id: decodedCursor.story_id,
            viewer_id: decodedCursor.viewer_id,
          },
        },
        skip: 1,
      }),
    });

    const hasNextPage = viewers?.length > limit;

    const items = hasNextPage ? viewers.slice(0, -1) : viewers;

    const nextCursor = hasNextPage
      ? encodeCursor(
          items[items.length - 1].viewer_id,
          items[items.length - 1].story_id,
        )
      : null;

    return {
      data: items.map((item) => ({
        user_id: item.viewer_id,
        full_name: `${item.viewer.profile?.first_name ?? ''} ${item.viewer.profile?.last_name ?? ''}`,
        viewed_at: item.viewed_at,
        avatar_url: item.viewer.profile?.avatar_url ?? '',
        username: item.viewer.profile?.username ?? '',
      })),
      story: await this.getFormattedStory(storyId, user.id),
      nextCursor,
    };
  };

  public deleteStory = async (storyId: string, email: string) => {
    const { user, story } = await this.validateUserStory(email, storyId);

    if (story.user_id !== user.id)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You are only allowed to delete your own story.`,
      });

    await this.prismaService.stories.delete({
      where: {
        id: storyId,
      },
    });

    return {
      success: true,
      message: `Your story has been successfully deleted.`,
    };
  };

  public getStory = async (storyId: string, email: string) => {
    const { user, story } = await this.validateUserStory(email, storyId);

    const isFriend = await firstValueFrom<boolean>(
      this.usersClient.send('check-friendship-status', {
        user_id_1: user.id,
        user_id_2: story.user_id,
      }),
    );

    if (!isFriend && user.id !== story.user_id) return null;

    return this.getFormattedStory(storyId, user.id);
  };

  private validateUserStory = async (email: string, storyId: string) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const story = await this.prismaService.stories.findUnique({
      where: {
        id: storyId,
      },
    });

    if (!story)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Story not found.`,
      });

    return {
      story,
      user,
    };
  };

  private getFormattedStory = async (
    storyId: string,
    currentUserId: string,
  ) => {
    const findStory = await this.prismaService.stories.findUnique({
      where: {
        id: storyId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        views: true,
        _count: {
          select: {
            views: true,
          },
        },
      },
    });

    if (!findStory)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Story not found.`,
      });

    return {
      ...omit(findStory, ['user_id', '_count', 'views']),
      user: {
        id: findStory.user.id,
        full_name: `${findStory.user.profile?.first_name ?? ''} ${findStory.user.profile?.last_name ?? ''}`,
        avatar_url: findStory.user.profile?.avatar_url,
        username: findStory.user.profile?.username,
      },
      viewed_by_current_user: findStory.views.some(
        (view) => view.viewer_id === currentUserId,
      ),
      total_views: findStory._count.views,
    };
  };

  private encodeCursor = (createdAt: Date, storyId: string): string => {
    const cursorStr = `${createdAt.toISOString()}::${storyId}`;
    return Buffer.from(cursorStr).toString('base64');
  };

  private decodeCursor = (
    cursor: string,
  ): { createdAt: Date; storyId: string } => {
    const decodedStr = Buffer.from(cursor, 'base64').toString('utf-8');
    const [createdAtStr, storyId] = decodedStr.split('::');
    return { createdAt: new Date(createdAtStr), storyId };
  };
}
