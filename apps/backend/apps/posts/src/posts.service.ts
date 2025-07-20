import {
  CreateBookMarkDto,
  DeleteBookMarksQueryDto,
  GetBookMarksQueryDto,
} from '@app/common/dtos/bookmarks';
import { CreateNotificationDto } from '@app/common/dtos/notifications';
import {
  CreateCommentDto,
  CreateCommentReplyDto,
  CreatePostDto,
  CreatePostImageDto,
  CreatePostShareDto,
  CreatePostVideoDto,
  GetCommentsMediaQueryDto,
  GetPostQueryDto,
  GetTaggedUsersQueryDto,
  GetUserLikesQueryDto,
  LikePostMediaDto,
  UnlikeMediaPostQueryDto,
  UpdatePostDto,
} from '@app/common/dtos/posts';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { HuggingFaceProvider } from '@app/common/providers';
import {
  CreateCommentForPost,
  CreateCommentTargetType,
  decodeCursor,
  encodeCursor,
  generateNotificationMessage,
  isToxic,
  PostMediaEnum,
  truncateWithEllipsis,
} from '@app/common/utils';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import {
  NotificationTypeEnum,
  PhotoTypeEnum,
  PostPrivaciesEnum,
  PostsType,
  UsersType,
} from '@repo/db';
import { omit, pick } from 'lodash';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PostsService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientKafka,
    private readonly huggingFaceProvider: HuggingFaceProvider,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientKafka,
  ) {}

  onModuleInit() {
    const postPatterns = [
      'get-me',
      'get-user-by-field',
      'get-friends',
      'get-mututal-friends',
      'check-friendship-status',
    ];

    postPatterns.forEach((pp) => this.usersClient.subscribeToResponseOf(pp));
  }

  public getProfilePosts = async (
    user_id: string,
    currentUserId: string,
    getPostQueryDto?: GetPostQueryDto,
  ) => {
    const limit = getPostQueryDto?.limit ?? 10;

    const decodedCursor = getPostQueryDto?.after
      ? decodeCursor(getPostQueryDto.after)
      : null;

    let posts = await this.prismaService.posts.findMany({
      where: this.buildProfilePostWhereClause(user_id),
      orderBy: { created_at: 'desc' },
      take: limit + 1,
      ...(decodedCursor && {
        cursor: { id: decodedCursor },
        skip: 1,
      }),
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        images: true,
        videos: true,
        tags: { include: { user: true } },
        contents: true,
        hashtags: { include: { hashtag: true } },
        _count: {
          select: {
            tags: true,
          },
        },
      },
    });

    if (user_id !== currentUserId) {
      posts = posts.filter(
        (p) =>
          p.privacy === PostPrivaciesEnum.public ||
          p.privacy === PostPrivaciesEnum.only_friend,
      );
    }

    const hasNextPage = posts.length > limit;

    const items = hasNextPage ? posts.slice(0, -1) : posts;

    return {
      data: await Promise.all(
        items.map((item) =>
          this.transformPostItem(
            item,
            currentUserId,
            item?.parent_post_id ? item.parent_post_id : undefined,
          ),
        ),
      ),
      nextCursor: hasNextPage ? encodeCursor(items[items.length - 1].id) : null,
    };
  };

  public getHomePosts = async (
    email: string,
    friendIds: string[],
    getPostQueryDto?: GetPostQueryDto,
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

    const user_id = user.id;

    const limit = getPostQueryDto?.limit ?? 10;

    const decodedCursor = getPostQueryDto?.after
      ? decodeCursor(getPostQueryDto.after)
      : null;

    const posts = await this.prismaService.posts.findMany({
      where: {
        OR: [
          { user_id: { in: friendIds } },
          { tags: { some: { tagged_user_id: user_id } } },
        ],
        privacy: PostPrivaciesEnum.public,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
      take: limit + 1,
      ...(decodedCursor && {
        cursor: { id: decodedCursor },
        skip: 1,
      }),
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        images: true,
        videos: true,
        tags: { include: { user: true } },
        contents: true,
        hashtags: { include: { hashtag: true } },
        _count: {
          select: {
            tags: true,
          },
        },
      },
    });

    const hasNextPage = posts.length > limit;

    const items = hasNextPage ? posts.slice(0, -1) : posts;

    return {
      data: await Promise.all(
        items.map((item) =>
          this.transformPostItem(
            item,
            user_id,
            item?.parent_post_id ? item.parent_post_id : undefined,
          ),
        ),
      ),
      nextCursor: hasNextPage ? encodeCursor(items[items.length - 1].id) : null,
    };
  };

  public createPost = async (email: string, createPostDto: CreatePostDto) => {
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

    const { images, videos, contents, tags, hashtags, ...res } = createPostDto;

    if (contents?.length) {
      for (const content of contents.map((c) => c.content)) {
        if (isToxic(await this.huggingFaceProvider.analyzeText(content)))
          throw new RpcException({
            statusCode: HttpStatus.FORBIDDEN,
            message: `Please review your post. It contains content that may not be appropriate.`,
          });
      }
    }

    const newPost = await this.prismaService.posts.create({
      data: {
        privacy: res.privacy,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    if (contents?.length)
      await Promise.all(
        contents.map((content) =>
          this.createPostRelation(
            this.prismaService.postContents,
            newPost,
            content,
          ),
        ),
      );

    await this.createMediaOfPost(newPost, images, videos);

    if (tags?.length) await this.createPostTags(tags, newPost.id, user);

    if (hashtags?.length) await this.createPostHashTags(hashtags, newPost.id);

    return this.getFormattedPost(newPost.id, user.id);
  };

  public deletePost = async (postId: string, email: string) => {
    await this.verifyModifyPost(email, postId);

    await this.prismaService.posts.delete({
      where: {
        id: postId,
      },
    });

    return {
      success: true,
      message: `Post has been successfully deleted.`,
    };
  };

  public updatePost = async (
    email: string,
    postId: string,
    updatePostDto: UpdatePostDto,
  ) => {
    const { user, post } = await this.verifyModifyPost(email, postId);

    const {
      images,
      videos,
      deletedMediaDto,
      privacy,
      contents,
      tags,
      hashtags,
    } = updatePostDto;

    if (privacy) {
      await this.prismaService.posts.update({
        where: {
          id: postId,
        },
        data: {
          privacy,
        },
      });
    }

    if (contents) {
      await this.prismaService.postContents.deleteMany({
        where: {
          post_id: postId,
        },
      });

      if (contents?.length) {
        await Promise.all(
          contents.map((content) =>
            this.createPostRelation(
              this.prismaService.postContents,
              postId,
              content,
            ),
          ),
        );
      }
    }

    if (tags?.length) {
      await this.prismaService.postTags.deleteMany({
        where: {
          post_id: postId,
        },
      });

      await this.createPostTags(tags, postId, user);
    }

    if (hashtags?.length) {
      await this.prismaService.postHashTags.deleteMany({
        where: {
          post_id: postId,
        },
      });

      await this.createPostHashTags(hashtags, postId);
    }

    await this.createMediaOfPost(post, images, videos);

    if (deletedMediaDto?.length) {
      await Promise.all(
        deletedMediaDto.map(async (media) => {
          const { url, type } = media;

          if (type === 'image') {
            await this.prismaService.postImages.deleteMany({
              where: {
                image_url: url,
              },
            });
          } else if (type === 'video') {
            await this.prismaService.postVideos.deleteMany({
              where: {
                video_url: url,
              },
            });
          }
        }),
      );
    }

    return this.getFormattedPost(postId, user.id);
  };

  private createMediaOfPost = async (
    post: any,
    images?: CreatePostImageDto[],
    videos?: CreatePostVideoDto[],
  ) => {
    if (images?.length)
      await Promise.all(
        images.map((image) =>
          this.createPostRelation(this.prismaService.postImages, post, image),
        ),
      );

    if (videos?.length)
      await Promise.all(
        videos.map((video) =>
          this.createPostRelation(this.prismaService.postVideos, post, video),
        ),
      );
  };

  private getFormattedPost = async (
    postId: string,
    userId: string,
    parent_post_id?: string,
  ) => {
    const item = await this.prismaService.posts.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        images: true,
        videos: true,
        tags: { include: { user: true } },
        contents: true,
        hashtags: { include: { hashtag: true } },
        _count: {
          select: {
            tags: true,
          },
        },
      },
    });

    return this.transformPostItem(item, userId, parent_post_id);
  };

  private verifyModifyPost = async (email: string, postId: string) => {
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

    const post = await this.prismaService.posts.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!post)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The post you're interacting with has been deleted. Please try again.`,
      });

    if (email !== post.user.email)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You're not authorized to modify this post.`,
      });

    return {
      user,
      post,
    };
  };

  private createPostRelation = async <T extends { id: string }>(
    model: { create: (args: { data: any }) => Promise<T> },
    post: any,
    dto: any,
  ): Promise<T> => {
    const record = await model.create({
      data: {
        ...dto,
        post: {
          connect: { id: post.id },
        },
      },
    });

    if (dto?.image_url?.trim()) {
      this.usersClient.emit(
        'create-photo-of-user',
        JSON.stringify({
          createPhotoOfUserDto: {
            url: dto.image_url,
            type: PhotoTypeEnum.POST,
            metadata: {
              post_image_id: record.id,
              post_id: post.id,
            },
            privacy: post.privacy,
          },
          user_id: post.user_id,
        }),
      );
    }

    return record;
  };

  private createPostTags = async (
    tags: string[],
    post_id: string,
    user: any,
  ) => {
    await Promise.all(
      tags.map((tag) =>
        this.prismaService.postTags.create({
          data: {
            tagged_user_id: tag,
            post_id: post_id,
          },
        }),
      ),
    );

    tags.forEach((tag) => {
      const createNotificationDto: CreateNotificationDto = {
        type: NotificationTypeEnum.tagged_in_post,
        content: generateNotificationMessage(
          NotificationTypeEnum.tagged_in_post,
          {
            senderName: `${user.profile?.first_name ?? ''} ${user.profile?.last_name ?? ''}`,
          },
        ),
        sender_id: user.id,
        recipient_id: tag,
        metadata: {
          post_id,
        },
      };

      this.notificationsClient.emit(
        'create-notification',
        createNotificationDto,
      );
    });
  };

  private createPostHashTags = async (hashtags: string[], post_id: string) => {
    await Promise.all(
      hashtags.map(async (hashtag) => {
        const findHashtag = await this.prismaService.hashTags.upsert({
          where: {
            name: hashtag,
          },
          create: {
            name: hashtag,
          },
          update: {},
        });

        await this.prismaService.postHashTags.create({
          data: {
            post_id,
            hashtag_id: findHashtag.id,
          },
        });
      }),
    );
  };

  private transformContent(contents: any[]) {
    return contents.map((ct) => ({
      id: ct.id,
      content: ct.content,
      type: ct.type,
    }));
  }

  private transformImages(images: any[]) {
    return images.map((img) => ({
      id: img.id,
      image_url: img.image_url,
      total_likes: img.total_likes,
      total_shares: img.total_shares,
      total_comments: img.total_comments,
    }));
  }

  private transformVideos(videos: any[]) {
    return videos.map((v) => ({
      id: v.id,
      video_url: v.video_url,
      total_likes: v.total_likes,
      total_shares: v.total_shares,
      total_comments: v.total_comments,
    }));
  }

  private transformHashtags(hashtags: any[]) {
    return hashtags.map((ht) => ({
      id: uuidv4(),
      hashtag: ht.hashtag.name,
    }));
  }

  private async transformPostItem(
    item: any,
    userId: string,
    parent_post_id?: string,
  ) {
    const likedByCurrentUser = await this.checkUserLikePost(item.id, userId);

    const taggedUsersData = await this.getTaggedUsersOfPost(item.id, userId);

    const markedByCurrentUser = await this.checkPostMarkedByUser(
      item.id,
      userId,
    );

    const taggedUsers = {
      data: taggedUsersData?.data ?? [],
      nextCursor: taggedUsersData?.nextCursor ?? null,
    };

    return {
      ...omit(item, ['_count', 'tags']),
      contents: this.transformContent(item.contents),
      images: this.transformImages(item.images),
      videos: this.transformVideos(item.videos),
      hashtags: this.transformHashtags(item.hashtags),
      user: pick(
        item.user,
        'id',
        'email',
        'profile.avatar_url',
        'profile.first_name',
        'profile.last_name',
        'profile.username',
      ),
      likedByCurrentUser,
      topLikedUsers: await this.getTopUsersWhoLikedPost(item.id, userId),
      total_tagged_users: item._count.tags,
      tagged_users: taggedUsers,
      ...(parent_post_id &&
        parent_post_id?.trim() !== '' && {
          parent_post: await this.getTransformedParentPost(
            parent_post_id,
            userId,
          ),
        }),
      markedByCurrentUser,
    };
  }

  private async getTransformedParentPost(
    parent_post_id: string,
    userId: string,
  ) {
    const parentPost = await this.prismaService.posts.findUnique({
      where: { id: parent_post_id },
      include: {
        user: { include: { profile: true } },
        images: true,
        videos: true,
        tags: { include: { user: true } },
        contents: true,
        hashtags: { include: { hashtag: true } },
        _count: {
          select: {
            tags: true,
          },
        },
      },
    });

    if (!parentPost) return null;

    return this.transformPostItem(parentPost, userId);
  }

  private buildProfilePostWhereClause(user_id: string) {
    return {
      OR: [
        { user_id },
        { tags: { some: { tagged_user_id: user_id } } },
        { shares: { some: { user_id } } },
      ],
      deleted_at: null,
    };
  }

  public likePost = async (email: string, postId: string) => {
    const { user, existingPost } = await this.verifyUserPost(email, postId);

    await this.createPostLike(user.id, existingPost);

    const fullContent = existingPost.contents.map((c) => c.content).join(' ');

    const postTitle = truncateWithEllipsis(fullContent);

    if (user.id !== existingPost.user_id) {
      const createNotificationDto: CreateNotificationDto = {
        type: NotificationTypeEnum.post_liked,
        content: generateNotificationMessage(NotificationTypeEnum.post_liked, {
          senderName: `${user.profile?.first_name ?? ''} ${user.profile?.last_name ?? ''}`,
          postTitle,
        }),
        sender_id: user.id,
        recipient_id: existingPost.user_id,
        metadata: {
          post_id: existingPost.id,
        },
      };

      this.notificationsClient.emit(
        'create-notification',
        createNotificationDto,
      );
    }

    return {
      post: await this.getFormattedPost(
        postId,
        user.id,
        existingPost?.parent_post_id ? existingPost.parent_post_id : undefined,
      ),
      topUsers: await this.getTopUsersWhoLikedPost(postId, user.id),
    };
  };

  public unlikePost = async (email: string, postId: string) => {
    const { user, existingPost } = await this.verifyUserPost(email, postId);

    await this.deletePostLike(user.id, existingPost);

    return {
      post: await this.getFormattedPost(
        postId,
        user.id,
        existingPost?.parent_post_id ? existingPost.parent_post_id : undefined,
      ),
      topUsers: await this.getTopUsersWhoLikedPost(postId, user.id),
    };
  };

  private createPostLike = async (user_id: string, post: PostsType) => {
    const whereCondition = {
      post_id_user_id: {
        user_id,
        post_id: post.id,
      },
    };

    const existingPostLike = await this.prismaService.postLikes.findUnique({
      where: whereCondition,
    });

    if (existingPostLike) {
      await this.prismaService.postLikes.update({
        where: whereCondition,
        data: {
          liked_at: new Date(),
        },
      });
    } else {
      await this.prismaService.postLikes.create({
        data: {
          post_id: post.id,
          user_id,
        },
      });

      await this.prismaService.posts.update({
        where: {
          id: post.id,
        },
        data: {
          total_likes: {
            increment: 1,
          },
        },
      });
    }
  };

  private verifyUserPost = async (email: string, postId: string) => {
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

    const existingPost = await this.prismaService.posts.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        contents: true,
        tags: true,
      },
    });

    if (!existingPost)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The post you're interacting with has been deleted. Please try again.`,
      });

    return {
      user,
      existingPost,
    };
  };

  private deletePostLike = async (userId: string, post: PostsType) => {
    const whereCondition = {
      post_id_user_id: {
        user_id: userId,
        post_id: post.id,
      },
    };

    const existingPostLike = await this.prismaService.postLikes.findUnique({
      where: whereCondition,
    });

    if (existingPostLike) {
      await this.prismaService.postLikes.delete({
        where: whereCondition,
      });

      await this.prismaService.posts.update({
        where: {
          id: post.id,
        },
        data: {
          total_likes: {
            decrement: 1,
          },
        },
      });
    }
  };

  private getTopUsersWhoLikedPost = async (postId: string, userId: string) => {
    const topUsersRaw = await this.prismaService.postLikes.findMany({
      where: { post_id: postId },
      orderBy: { liked_at: 'desc' },
      take: 3,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    const currentUserIndex = topUsersRaw.findIndex(
      (like) => like.user_id === userId,
    );

    const topUsers = topUsersRaw.map((like) => ({
      id: like.user.id,
      full_name:
        like.user_id === userId
          ? 'You'
          : like.user.profile?.first_name + ' ' + like.user.profile?.last_name,
    }));

    if (currentUserIndex === -1) {
      const currentUserLike = await this.prismaService.postLikes.findFirst({
        where: { post_id: postId, user_id: userId },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (currentUserLike) {
        const you = {
          id: currentUserLike.user.id,
          full_name: 'You',
        };

        topUsers.unshift(you);

        if (topUsers.length > 3) {
          topUsers.pop();
        }
      }
    } else if (currentUserIndex > 0) {
      const you = topUsers.splice(currentUserIndex, 1)[0];
      topUsers.unshift(you);
    }

    return topUsers;
  };

  private checkPostMarkedByUser = async (postId: string, userId: string) => {
    const bookmark = await this.prismaService.bookMarks.findUnique({
      where: {
        user_id_post_id: {
          user_id: userId,
          post_id: postId,
        },
      },
    });

    return Boolean(bookmark);
  };

  private checkUserLikePost = async (postId: string, userId: string) => {
    const like = await this.prismaService.postLikes.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    return Boolean(like);
  };

  public getLikes = async (
    email: string,
    postId: string,
    getUserLikesQueryDto?: GetUserLikesQueryDto,
  ) => {
    function encodeCursor(likedAt: Date, userId: string): string {
      const cursorStr = `${likedAt.toISOString()}::${userId}`;
      return Buffer.from(cursorStr).toString('base64');
    }

    function decodeCursor(cursor: string): { likedAt: Date; userId: string } {
      const decodedStr = Buffer.from(cursor, 'base64').toString('utf-8');
      const [likedAtStr, userId] = decodedStr.split('::');
      return { likedAt: new Date(likedAtStr), userId };
    }

    await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const limit = getUserLikesQueryDto?.limit ?? 10;

    const decodedCursor = getUserLikesQueryDto?.after
      ? decodeCursor(getUserLikesQueryDto.after)
      : null;

    const likes = await this.prismaService.postLikes.findMany({
      where: {
        post_id: postId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: [{ liked_at: 'desc' }, { user_id: 'desc' }],
      take: limit + 1,
      ...(decodedCursor && {
        cursor: {
          post_id_user_id: {
            post_id: postId,
            user_id: decodedCursor.userId,
          },
        },
        skip: 1,
      }),
    });

    const hasNextPage = likes.length > limit;

    const items = hasNextPage ? likes.slice(0, -1) : likes;

    return {
      data: items.map((item) => ({
        id: item.user_id,
        email: item.user.email,
        avatar_url: item.user.profile?.avatar_url,
        full_name:
          item.user.profile?.first_name + ' ' + item.user?.profile?.last_name,
        liked_at: item.liked_at,
      })),
      nextCursor: hasNextPage
        ? encodeCursor(
            items[items.length - 1].liked_at,
            items[items.length - 1].user_id,
          )
        : null,
    };
  };

  public createComment = async (
    email: string,
    postId: string,
    createCommentDto: CreateCommentDto,
  ) => {
    const { user, existingPost } = await this.verifyUserPost(email, postId);

    const { contents, media_id, targetType, parent_comment_id } =
      createCommentDto;

    const validContents: string[] = [];

    if (contents?.length) {
      for (const content of contents.map((c) => c.content)) {
        if (isToxic(await this.huggingFaceProvider.analyzeText(content)))
          throw new RpcException({
            statusCode: HttpStatus.FORBIDDEN,
            message: `Your comment contains inappropriate language. Please remove any offensive words to proceed.`,
          });

        validContents.push(content);
      }
    }

    const comments: Awaited<
      ReturnType<PostsService['createCommentForPost']>
    >[] = [];

    for (const content of validContents) {
      const baseData = {
        user_id: user.id,
        content,
      };

      if (parent_comment_id) {
        const parentComment = await this.prismaService.comments.findUnique({
          where: {
            id: parent_comment_id,
          },
        });

        if (!parentComment)
          throw new RpcException({
            statusCode: HttpStatus.NOT_FOUND,
            message: `The comment you are trying to reply to no longer exists. Please refresh and try again.`,
          });

        comments.push(
          await this.createCommentForPost({
            ...baseData,
            parent_comment_id,
          }),
        );
      } else if (media_id) {
        comments.push(
          await this.createCommentForPost({
            ...baseData,
            ...(targetType === CreateCommentTargetType.IMAGE
              ? { post_image_id: media_id }
              : {
                  post_video_id: media_id,
                }),
          }),
        );
      } else if (targetType === CreateCommentTargetType.POST) {
        comments.push(
          await this.createCommentForPost({
            ...baseData,
            post_id: postId,
          }),
        );
      }
    }

    comments.forEach((comment) => {
      if (user.id !== existingPost.user_id) {
        const createNotificationDto: CreateNotificationDto = {
          type: NotificationTypeEnum.post_commented,
          content: generateNotificationMessage(
            NotificationTypeEnum.post_commented,
            {
              senderName: `${user.profile?.first_name ?? ''} ${user.profile?.last_name ?? ''}`,
              commentContent: truncateWithEllipsis(comment.content),
            },
          ),
          recipient_id: existingPost.user_id,
          sender_id: user.id,
          metadata: {
            comment_id: comment.id,
            post_id: existingPost.id,
          },
        };

        this.notificationsClient.emit(
          'create-notification',
          createNotificationDto,
        );
      }
    });

    return {
      post: await this.getFormattedPost(
        postId,
        user.id === existingPost.user_id ? user.id : existingPost.user_id,
        existingPost?.parent_post_id ? existingPost.parent_post_id : undefined,
      ),
      comments: await Promise.all(
        comments.map(async (comment) =>
          this.getFormattedComment(comment.id, user.id),
        ),
      ),
      ...(parent_comment_id && {
        parentComment: await this.getFormattedComment(
          parent_comment_id,
          user.id,
        ),
      }),
      ...(media_id &&
        media_id?.trim() !== '' && {
          post_media: await this.getMediaOfPost(
            postId,
            media_id,
            targetType === CreateCommentTargetType.IMAGE
              ? PostMediaEnum.IMAGE
              : PostMediaEnum.VIDEO,
            email,
          ),
        }),
    };
  };

  private createCommentForPost = async (
    createCommentForPostDto: CreateCommentForPost,
  ) => {
    const {
      post_id,
      post_image_id,
      post_video_id,
      parent_comment_id,
      user_id,
      content,
    } = createCommentForPostDto;

    const baseData = {
      user_id,
      ...(post_id && { post_id }),
      ...(post_image_id && { post_image_id }),
      ...(post_video_id && { post_video_id }),
      ...(parent_comment_id && { parent_comment_id }),
      content,
    };

    const newComent = await this.prismaService.comments.create({
      data: baseData,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (post_id) {
      await this.prismaService.posts.update({
        where: {
          id: post_id,
        },
        data: {
          total_comments: {
            increment: 1,
          },
        },
      });
    } else if (parent_comment_id) {
      const rootComment = await this.findRootComment(parent_comment_id);

      if (!rootComment?.post_id) {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Root comment is not linked to a post.',
        });
      }

      await this.prismaService.posts.update({
        where: {
          id: rootComment.post_id,
        },
        data: {
          total_comments: {
            increment: 1,
          },
        },
      });
    } else if (post_image_id) {
      await this.prismaService.postImages.update({
        where: {
          id: post_image_id,
        },
        data: {
          total_comments: {
            increment: 1,
          },
        },
      });
    } else if (post_video_id) {
      await this.prismaService.postVideos.update({
        where: {
          id: post_video_id,
        },
        data: {
          total_comments: {
            increment: 1,
          },
        },
      });
    }

    return newComent;
  };

  private findRootComment = async (commentId: string) => {
    let comment = await this.prismaService.comments.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Comment not found.',
      });
    }

    while (comment?.parent_comment_id) {
      const parent = await this.prismaService.comments.findUnique({
        where: { id: comment.parent_comment_id },
      });

      if (!parent) {
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Comment not found.',
        });
      }

      comment = parent;
    }

    return comment;
  };

  public getComments = async (
    postId: string,
    email: string,
    getCommentQueryDto?: GetPostQueryDto,
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

    const post = await this.prismaService.posts.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The post you're interacting with has been deleted. Please try again.`,
      });
    }

    function encodeCursor(data: { id: string; created_at: Date }): string {
      return Buffer.from(JSON.stringify(data)).toString('base64');
    }

    function decodeCursor(cursor: string): { id: string; created_at: Date } {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      return {
        id: parsed.id,
        created_at: new Date(parsed.created_at),
      };
    }

    const limit = getCommentQueryDto?.limit ?? 10;

    const decodedCursor = getCommentQueryDto?.after
      ? decodeCursor(getCommentQueryDto.after)
      : null;

    const comments = await Promise.all(
      (
        await this.prismaService.comments.findMany({
          where: {
            post_id: postId,
            parent_comment_id: null,
          },
          select: {
            id: true,
            content: true,
            created_at: true,
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    first_name: true,
                    last_name: true,
                    avatar_url: true,
                  },
                },
              },
            },
            comment_likes: true,
            parent_comment_id: true,
            _count: {
              select: {
                comments: true,
                comment_likes: true,
              },
            },
          },
          take: limit + 1,
          ...(decodedCursor && {
            cursor: decodedCursor,
            skip: 1,
          }),
          orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        })
      ).map(async (comment) => {
        const likedByCurrentUser = comment.comment_likes.some(
          (cl) => cl.user_id === user.id,
        );

        const rootParentElement = await this.findRootParentComment(comment.id);

        return {
          id: comment.id,
          created_at: comment.created_at,
          content: comment.content,
          total_replies: comment._count.comments,
          total_likes: comment._count.comment_likes,
          parent_id: comment.parent_comment_id ?? null,
          likedByCurrentUser,
          type: rootParentElement?.post_id
            ? CreateCommentTargetType.POST
            : rootParentElement?.post_image_id
              ? CreateCommentTargetType.IMAGE
              : CreateCommentTargetType.VIDEO,
          user: {
            id: comment.user.id,
            full_name:
              `${comment.user.profile?.first_name ?? ''} ${comment.user.profile?.last_name ?? ''}`.trim(),
            avatar_url: comment.user.profile?.avatar_url,
          },
        };
      }),
    );

    const hasNextPage = comments.length > limit;

    const items = hasNextPage ? comments.slice(0, -1) : comments;

    const lastComment = items[items.length - 1];

    const nextCursor = hasNextPage
      ? encodeCursor({
          id: lastComment.id,
          created_at: lastComment.created_at,
        })
      : null;

    return {
      data: items,
      nextCursor,
    };
  };

  public deleteComment = async (
    postId: string,
    commentId: string,
    email: string,
  ) => {
    const { user, post, comment } = await this.validateUserPostComment(
      email,
      postId,
      commentId,
    );

    if (comment.user_id !== user.id && post.user_id !== user.id)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You can only delete your own comment.`,
      });

    await this.prismaService.posts.update({
      where: {
        id: postId,
      },
      data: {
        total_comments: {
          decrement: 1,
        },
      },
    });

    await this.prismaService.comments.delete({
      where: {
        id: commentId,
      },
    });

    return this.getFormattedPost(
      postId,
      user.id === post.user_id ? user.id : post.user_id,
    );
  };

  public createCommentReply = async (
    postId: string,
    commentId: string,
    createCommentReplyDto: CreateCommentReplyDto,
    email: string,
  ) => {
    const { user, comment, post } = await this.validateUserPostComment(
      email,
      postId,
      commentId,
    );

    const { contents } = createCommentReplyDto;

    const validContents: string[] = [];

    if (contents?.length) {
      for (const content of contents.map((c) => c.content)) {
        if (isToxic(await this.huggingFaceProvider.analyzeText(content)))
          throw new RpcException({
            statusCode: HttpStatus.FORBIDDEN,
            message: `Your comment contains inappropriate language. Please remove any offensive words to proceed.`,
          });

        validContents.push(content);
      }
    }

    const newComments: any[] = [];

    for (const newContent of validContents) {
      const baseData = {
        user_id: user.id,
        content: newContent,
      };

      newComments.push(
        await this.createCommentForPost({
          ...baseData,
          parent_comment_id: comment.id,
        }),
      );
    }

    if (newComments.length) {
      newComments.forEach((newComment) => {
        if (user.id !== comment.user_id) {
          const createNotificationDto: CreateNotificationDto = {
            type: NotificationTypeEnum.comment_replied,
            content: generateNotificationMessage(
              NotificationTypeEnum.comment_replied,
              {
                senderName: `${user.profile?.first_name ?? ''} ${user.profile?.last_name ?? ''}`,
                commentContent: truncateWithEllipsis(newComment.content),
              },
            ),
            sender_id: user.id,
            recipient_id: comment.user_id,
            metadata: {
              post_id: postId,
              parent_comment_id: commentId,
              comment_id: newComment.id,
              post_username: post.user.profile?.username ?? '',
            },
          };

          this.notificationsClient.emit(
            'create-notification',
            createNotificationDto,
          );
        }
      });
    }

    return {
      post: await this.getFormattedPost(
        postId,
        user.id === post.user_id ? user.id : post.user_id,
        post?.parent_post_id ? post.parent_post_id : undefined,
      ),
      comments: await Promise.all(
        newComments.map(async (comment) =>
          this.getFormattedComment(comment.id, user.id),
        ),
      ),
      parentComment: await this.getFormattedComment(commentId, user.id),
    };
  };

  public getCommentReplies = async (
    postId: string,
    commentId: string,
    email: string,
    getCommentReplyQueryDto?: GetPostQueryDto,
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

    const post = await this.prismaService.posts.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The post you're interacting with has been deleted. Please try again.`,
      });

    const comment = await this.prismaService.comments.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The comment you're trying to get replies doesn't exist. Please try again.`,
      });

    function encodeCursor(data: { id: string; created_at: Date }): string {
      return Buffer.from(JSON.stringify(data)).toString('base64');
    }

    function decodeCursor(cursor: string): { id: string; created_at: Date } {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8');

      const parsed = JSON.parse(decoded);

      return {
        id: parsed.id,
        created_at: new Date(parsed.created_at),
      };
    }

    const limit = getCommentReplyQueryDto?.limit ?? 10;

    const decodedCursor = getCommentReplyQueryDto?.after
      ? decodeCursor(getCommentReplyQueryDto.after)
      : null;

    const rootParentElement = await this.findRootParentComment(comment.id);

    const replies = (
      await this.prismaService.comments.findMany({
        where: {
          parent_comment_id: commentId,
          deleted_at: null,
        },
        select: {
          id: true,
          created_at: true,
          content: true,
          parent_comment_id: true,
          _count: {
            select: {
              comments: true,
              comment_likes: true,
            },
          },
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  first_name: true,
                  last_name: true,
                  avatar_url: true,
                },
              },
            },
          },
          post_id: true,
          post_image_id: true,
          post_video_id: true,
          comment_likes: true,
        },
        take: limit + 1,
        ...(decodedCursor && {
          cursor: {
            id: decodedCursor.id,
            created_at: decodedCursor.created_at,
          },
          skip: 1,
        }),
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      })
    ).map((comment) => {
      const likedByCurrentUser = comment.comment_likes.some(
        (cl) => cl.user_id === user.id,
      );

      return {
        id: comment.id,
        created_at: comment.created_at,
        content: comment.content,
        total_replies: comment._count.comments,
        total_likes: comment._count.comment_likes,
        likedByCurrentUser,
        parent_id: comment.parent_comment_id ?? null,
        type: rootParentElement?.post_id
          ? CreateCommentTargetType.POST
          : rootParentElement?.post_image_id
            ? CreateCommentTargetType.IMAGE
            : CreateCommentTargetType.VIDEO,
        user: {
          id: comment.user.id,
          full_name:
            `${comment.user.profile?.first_name ?? ''} ${comment.user.profile?.last_name ?? ''}`.trim(),
          avatar_url: comment.user.profile?.avatar_url,
        },
      };
    });

    const hasNextPage = replies.length > limit;

    const items = hasNextPage ? replies.slice(0, -1) : replies;

    const lastItem = items[items.length - 1];

    const nextCursor = hasNextPage
      ? encodeCursor({
          id: lastItem.id,
          created_at: lastItem.created_at,
        })
      : null;

    return {
      data: items,
      nextCursor,
    };
  };

  private getCommentById = async (commentId: string) => {
    const comment = await this.prismaService.comments.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The comment you are trying to find to no longer exists. Please refresh and try again.`,
      });

    return comment;
  };

  private findRootParentComment = async (commentId: string) => {
    const comment = await this.getCommentById(commentId);

    if (!comment) return null;

    if (!comment.parent_comment_id) return comment;

    return this.findRootParentComment(comment.parent_comment_id);
  };

  public likeComment = async (
    postId: string,
    commentId: string,
    email: string,
  ) => {
    const { user, comment, post } = await this.validateUserPostComment(
      email,
      postId,
      commentId,
    );

    await this.prismaService.commentLikes.upsert({
      where: {
        user_id_comment_id: {
          user_id: user.id,
          comment_id: commentId,
        },
      },
      create: {
        user_id: user.id,
        comment_id: commentId,
      },
      update: {
        created_at: new Date(),
      },
    });

    if (user.id !== comment.user_id) {
      const createNotificationDto: CreateNotificationDto = {
        type: NotificationTypeEnum.comment_liked,
        content: generateNotificationMessage(
          NotificationTypeEnum.comment_liked,
          {
            senderName: `${user.profile?.first_name ?? ''} ${user.profile?.last_name ?? ''}`,
          },
        ),
        sender_id: user.id,
        recipient_id: comment.user_id,
        metadata: {
          comment_id: comment.id,
          post_id: post.id,
          post_username: post.user.profile?.username ?? '',
        },
      };

      this.notificationsClient.emit(
        'create-notification',
        createNotificationDto,
      );
    }

    return this.getFormattedComment(commentId, user.id);
  };

  private getFormattedComment = async (commentId: string, user_id: string) => {
    const comment = await this.prismaService.comments.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        created_at: true,
        comment_likes: true,
        _count: {
          select: {
            comments: true,
            comment_likes: true,
          },
        },
        content: true,
        parent_comment_id: true,
        user: {
          select: {
            id: true,
            profile: {
              select: {
                first_name: true,
                last_name: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });

    if (!comment)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The comment you're trying to interact doesn't exist. Please try again.`,
      });

    const likedByCurrentUser = comment.comment_likes.some(
      (cl) => cl.user_id === user_id,
    );

    const rootParentElement = await this.findRootParentComment(commentId);

    return {
      id: comment.id,
      created_at: comment.created_at,
      content: comment.content,
      total_replies: comment._count.comments,
      total_likes: comment._count.comment_likes,
      parent_id: comment?.parent_comment_id ?? null,
      likedByCurrentUser,
      type: rootParentElement?.post_id
        ? CreateCommentTargetType.POST
        : rootParentElement?.post_image_id
          ? CreateCommentTargetType.IMAGE
          : CreateCommentTargetType.VIDEO,
      user: {
        id: comment.user.id,
        full_name:
          `${comment.user.profile?.first_name ?? ''} ${comment.user.profile?.last_name ?? ''}`.trim(),
        avatar_url: comment.user.profile?.avatar_url,
      },
    };
  };

  private validateUserPostComment = async (
    email: string,
    postId: string,
    commentId: string,
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

    const post = await this.prismaService.posts.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!post)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The post you're interacting with has been deleted. Please try again.`,
      });

    const comment = await this.prismaService.comments.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The comment you're trying to interact doesn't exist. Please try again.`,
      });

    return {
      user,
      post,
      comment,
    };
  };

  public unlikeComment = async (
    postId: string,
    commentId: string,
    email: string,
  ) => {
    const { user, comment } = await this.validateUserPostComment(
      email,
      postId,
      commentId,
    );

    await this.prismaService.commentLikes.delete({
      where: {
        user_id_comment_id: {
          user_id: user.id,
          comment_id: comment.id,
        },
      },
    });

    return this.getFormattedComment(comment.id, user.id);
  };

  public getLikesOfComment = async (
    postId: string,
    commentId: string,
    getCommentLikeQueryDto?: GetPostQueryDto,
  ) => {
    const post = await this.prismaService.posts.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The post you're interacting with has been deleted. Please try again.`,
      });

    const comment = await this.prismaService.comments.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The comment you're trying to get likes doesn't exist. Please try again.`,
      });

    function encodeCursor(likedAt: Date, userId: string): string {
      const cursorStr = `${likedAt.toISOString()}::${userId}`;
      return Buffer.from(cursorStr).toString('base64');
    }

    function decodeCursor(cursor: string): { likedAt: Date; userId: string } {
      const decodedStr = Buffer.from(cursor, 'base64').toString('utf-8');
      const [likedAtStr, userId] = decodedStr.split('::');
      return { likedAt: new Date(likedAtStr), userId };
    }

    const limit = getCommentLikeQueryDto?.limit ?? 10;

    const decodedCursor = getCommentLikeQueryDto?.after
      ? decodeCursor(getCommentLikeQueryDto.after)
      : null;

    const likes = await this.prismaService.commentLikes.findMany({
      where: {
        comment_id: commentId,
      },
      orderBy: [
        {
          created_at: 'desc',
        },
        {
          user_id: 'desc',
        },
      ],
      select: {
        id: true,
        user: {
          select: {
            id: true,
            profile: {
              select: {
                first_name: true,
                last_name: true,
                avatar_url: true,
              },
            },
          },
        },
        created_at: true,
      },
      take: limit + 1,
      ...(decodedCursor && {
        cursor: {
          user_id_comment_id: {
            user_id: decodedCursor.userId,
            comment_id: commentId,
          },
        },
        skip: 1,
      }),
    });

    const hasNextPage = likes.length > limit;

    const items = hasNextPage ? likes.slice(0, -1) : likes;

    const nextCursor = hasNextPage
      ? encodeCursor(
          items[items.length - 1].created_at,
          items[items.length - 1].user.id,
        )
      : null;

    return {
      data: items.map((item) => ({
        id: item.id,
        user: {
          id: item.user.id,
          full_name: `${item.user.profile?.first_name ?? ''} ${item.user.profile?.last_name ?? ''}`,
          avatar_url: item.user.profile?.avatar_url ?? '',
        },
        liked_at: item.created_at,
      })),
      nextCursor,
    };
  };

  public createPostShare = async (
    postId: string,
    email: string,
    createPostShareDto: CreatePostShareDto,
  ) => {
    const { user, existingPost: post } = await this.verifyUserPost(
      email,
      postId,
    );

    const { contents, privacy, hashtags } = createPostShareDto;

    for (const content of contents.map((c) => c.content)) {
      if (isToxic(await this.huggingFaceProvider.analyzeText(content)))
        throw new RpcException({
          statusCode: HttpStatus.FORBIDDEN,
          message: `Please review your post. It contains content that may not be appropriate.`,
        });
    }

    const newPost = await this.prismaService.posts.create({
      data: {
        privacy,
        parent: {
          connect: {
            id: postId,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (contents?.length)
      await Promise.all(
        contents.map((content) =>
          this.createPostRelation(
            this.prismaService.postContents,
            newPost,
            content,
          ),
        ),
      );

    if (hashtags?.length) await this.createPostHashTags(hashtags, newPost.id);

    if (user.id !== post.user_id) {
      const createNotificationDto: CreateNotificationDto = {
        type: NotificationTypeEnum.post_shared,
        content: generateNotificationMessage(NotificationTypeEnum.post_shared, {
          senderName: `${user.profile?.first_name ?? ''} ${user.profile?.last_name ?? ''}`,
        }),
        sender_id: user.id,
        recipient_id: post.user_id,
        metadata: {
          parent_post_id: postId,
          post_id: newPost.id,
          post_username: newPost.user.profile?.username ?? '',
          parent_post_username: post.user.profile?.username ?? '',
        },
      };

      this.notificationsClient.emit(
        'create-notification',
        createNotificationDto,
      );
    }

    return this.getFormattedPost(newPost.id, user.id, postId);
  };

  public getMediaOfPost = async (
    postId: string,
    mediaId: string,
    type: PostMediaEnum,
    email: string,
  ) => {
    const { media, post, user } = await this.verifyUserPostMedia(
      email,
      postId,
      mediaId,
      type,
    );

    if (!media)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The ${type === PostMediaEnum.IMAGE ? 'image' : 'video'} of post you're interacting with has been deleted. Please try again.`,
      });

    if (
      (type === PostMediaEnum.IMAGE &&
        !post.images.some((im) => im.id === media.id)) ||
      (type === PostMediaEnum.VIDEO &&
        !post.videos.some((vi) => vi.id === media.id))
    )
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `The ${type === PostMediaEnum.IMAGE ? 'image' : 'video'} of post you're interacting isn't belong to this post. Please try again.`,
      });

    const likedByCurrentUser = media.likes.some(
      (ml: any) => ml.user_id === user.id,
    ) as boolean;

    return {
      ...omit(media, ['likes']),
      likedByCurrentUser,
    };
  };

  public getCommentsMedia = async (
    postId: string,
    mediaId: string,
    email: string,
    getCommentsMediaQueryDto: GetCommentsMediaQueryDto,
  ) => {
    const { type } = getCommentsMediaQueryDto;

    await this.verifyUserPostMedia(email, postId, mediaId, type);

    const whereCondition =
      type === PostMediaEnum.IMAGE
        ? {
            post_image_id: mediaId,
          }
        : {
            post_video_id: mediaId,
          };

    const limit = getCommentsMediaQueryDto?.limit ?? 10;

    const decodedCursor = getCommentsMediaQueryDto?.after
      ? decodeCursor(getCommentsMediaQueryDto.after)
      : null;

    const comments = await this.prismaService.comments.findMany({
      where: whereCondition,
      orderBy: { created_at: 'desc' },
      take: limit + 1,
      ...(decodedCursor && {
        cursor: {
          id: decodedCursor.id,
          created_at: decodedCursor.created_at,
        },
        skip: 1,
      }),
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        ...(type === PostMediaEnum.IMAGE
          ? {
              post_image: true,
            }
          : { post_video: true }),
        _count: {
          select: {
            comment_likes: true,
          },
        },
      },
    });

    const hasNextPage = comments.length > limit;

    const items = hasNextPage ? comments.slice(0, -1) : comments;

    const lastComment = items[items.length - 1];

    const nextCursor = hasNextPage
      ? encodeCursor({
          id: lastComment.id,
          created_at: lastComment.created_at,
        })
      : null;

    return {
      data: items.map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        updated_at: c.updated_at,
        total_likes: c._count.comment_likes,
        user: {
          id: c.user.id,
          full_name: c.user.profile.first_name + ' ' + c.user.profile.last_name,
          avatar_url: c.user.profile.avatar_url,
        },
      })),
      nextCursor,
    };
  };

  private verifyUserPostMedia = async (
    email: string,
    postId: string,
    mediaId: string,
    type: PostMediaEnum,
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

    const post = await this.prismaService.posts.findUnique({
      where: {
        id: postId,
      },
      include: {
        videos: true,
        images: true,
      },
    });

    if (!post)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The post you're interacting with has been deleted. Please try again.`,
      });

    let media: any = null;

    if (type === PostMediaEnum.IMAGE) {
      media = await this.prismaService.postImages.findUnique({
        where: {
          id: mediaId,
        },
        include: {
          likes: true,
        },
      });
    } else if (type === PostMediaEnum.VIDEO) {
      media = await this.prismaService.postVideos.findUnique({
        where: {
          id: mediaId,
        },
        include: {
          likes: true,
        },
      });
    }

    if (!media)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The ${type === PostMediaEnum.IMAGE ? 'image' : 'video'} of post you're interacting with has been deleted. Please try again.`,
      });

    return {
      user,
      post,
      media,
    };
  };

  public likeMediaOfPost = async (
    postId: string,
    mediaId: string,
    email: string,
    likePostMediaDto: LikePostMediaDto,
  ) => {
    const { type } = likePostMediaDto;

    const { media, user } = await this.verifyUserPostMedia(
      email,
      postId,
      mediaId,
      type,
    );

    if (type === PostMediaEnum.IMAGE) {
      await this.prismaService.postImageLikes.create({
        data: {
          user_id: user.id,
          post_image_id: media.id,
        },
      });

      await this.prismaService.postImages.update({
        where: {
          id: media.id,
        },
        data: {
          total_likes: {
            increment: 1,
          },
        },
      });
    } else if (type === PostMediaEnum.VIDEO) {
      await this.prismaService.postVideoLikes.create({
        data: {
          user_id: user.id,
          post_video_id: media.id,
        },
      });

      await this.prismaService.postVideos.update({
        where: {
          id: media.id,
        },
        data: {
          total_likes: {
            increment: 1,
          },
        },
      });
    }

    return this.getMediaOfPost(postId, mediaId, type, email);
  };

  public unlikeMediaOfPost = async (
    postId: string,
    mediaId: string,
    email: string,
    unlikeMediaPostDto: UnlikeMediaPostQueryDto,
  ) => {
    const { type } = unlikeMediaPostDto;

    const { user } = await this.verifyUserPostMedia(
      email,
      postId,
      mediaId,
      type,
    );

    if (type === PostMediaEnum.IMAGE) {
      await this.prismaService.postImageLikes.delete({
        where: {
          post_image_id_user_id: {
            user_id: user.id,
            post_image_id: mediaId,
          },
        },
      });

      await this.prismaService.postImages.update({
        where: {
          id: mediaId,
        },
        data: {
          total_likes: {
            decrement: 1,
          },
        },
      });
    } else if (type === PostMediaEnum.VIDEO) {
      await this.prismaService.postVideoLikes.delete({
        where: {
          post_video_id_user_id: {
            user_id: user.id,
            post_video_id: mediaId,
          },
        },
      });

      await this.prismaService.postVideos.update({
        where: {
          id: mediaId,
        },
        data: {
          total_likes: {
            decrement: 1,
          },
        },
      });
    }

    return this.getMediaOfPost(postId, mediaId, type, email);
  };

  public getPostOfUser = async (
    postId: string,
    username: string,
    email: string,
  ) => {
    const currentUser = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'username',
          value: username,
        }),
      ),
    ).catch((error) => {
      throw new RpcException({
        statusCode: error?.statusCode || 500,
        message: error?.message || 'Microservice error',
      });
    });

    const post = await this.prismaService.posts.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The post could not be found.`,
      });

    if (post.user_id !== user.id)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `The post does not belong to this user.`,
      });

    const friendIds = await firstValueFrom<string[]>(
      this.usersClient.send('get-friends', {
        email: user.email,
      }),
    );

    const isFriend = friendIds.some((friendId) => friendId === currentUser.id);

    if (isFriend && post.privacy === PostPrivaciesEnum.only_me) return null;

    if (
      !isFriend &&
      post.privacy !== PostPrivaciesEnum.public &&
      currentUser.id !== user.id
    )
      return null;

    return this.getFormattedPost(
      postId,
      currentUser.id,
      post?.parent_post_id ? post.parent_post_id : undefined,
    );
  };

  public getTaggedUsersOfPost = async (
    postId: string,
    userId: string,
    getTaggedUsersQueryDto?: GetTaggedUsersQueryDto,
  ) => {
    try {
      const existingPost = await this.prismaService.posts.findUnique({
        where: {
          id: postId,
        },
      });

      if (!existingPost)
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Post not found.`,
        });

      if (
        existingPost.user_id !== userId &&
        existingPost.privacy === PostPrivaciesEnum.only_me
      )
        throw new RpcException({
          statusCode: HttpStatus.FORBIDDEN,
          message: `This post is set to private, so you don't have permission to view the list of users tagged in it.`,
        });

      const limit = getTaggedUsersQueryDto?.limit ?? 10;

      const decodedCursor = getTaggedUsersQueryDto?.after
        ? decodeCursor(getTaggedUsersQueryDto.after)
        : null;

      const taggedUsers: any[] = await this.prismaService.postTags.findMany({
        where: {
          post_id: postId,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        take: limit + 1,
        ...(decodedCursor && {
          cursor: {
            post_id_tagged_user_id: {
              post_id: decodedCursor.post_id,
              tagged_user_id: decodedCursor.tagged_user_id,
            },
          },
          skip: 1,
        }),
      });

      const hasNextPage = taggedUsers.length > limit;

      const items = hasNextPage ? taggedUsers.slice(0, -1) : taggedUsers;

      const nextCursor = hasNextPage
        ? encodeCursor({
            post_id: items[items.length - 1].post_id,
            tagged_user_id: items[items.length - 1].tagged_user_id,
          })
        : null;

      return {
        data: items.map((item) => ({
          user_id: item.tagged_user_id,
          full_name: `${item.user.profile?.first_name ?? ''} ${item.user.profile?.last_name ?? ''}`,
          avatar_url: item.user.profile?.avatar_url ?? '',
          username: item?.user?.profile?.username ?? '',
          mutual_friends: 0,
          is_friend: true,
        })),
        nextCursor,
      };
    } catch (error) {
      console.error(error);
    }
  };

  public createBookmark = async (
    email: string,
    createBookMarkDto: CreateBookMarkDto,
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

    const { postId } = createBookMarkDto;

    const existingPost = await this.prismaService.posts.findUnique({
      where: {
        id: postId,
      },
    });

    if (!existingPost)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post not found.',
      });

    const bookmark = await this.prismaService.bookMarks.upsert({
      where: {
        user_id_post_id: {
          user_id: user.id,
          post_id: postId,
        },
      },
      create: {
        user_id: user.id,
        post_id: postId,
      },
      update: {
        saved_at: new Date(),
      },
    });

    return this.getFormattedBookMark(bookmark.id, user.id);
  };

  public getFormattedBookMark = async (bookMarkId: string, userId: string) => {
    const bookmark = await this.prismaService.bookMarks.findUnique({
      where: {
        id: bookMarkId,
      },
      include: {
        post: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            images: true,
            videos: true,
            tags: { include: { user: true } },
            contents: true,
            hashtags: { include: { hashtag: true } },
            _count: {
              select: {
                tags: true,
              },
            },
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!bookmark)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Book mark not found.`,
      });

    if (bookmark.user_id !== userId)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You can only access your own bookmarks.`,
      });

    return {
      id: bookMarkId,
      saved_at: bookmark.saved_at,
      post: await this.transformPostItem(
        bookmark.post,
        userId,
        bookmark.post?.parent_post_id
          ? bookmark.post.parent_post_id
          : undefined,
      ),
      user: omit(bookmark.user, ['password']),
    };
  };

  public getBookmarks = async (
    email: string,
    getBookMarksQueryDto: GetBookMarksQueryDto,
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

    const limit = getBookMarksQueryDto?.limit ?? 10;

    const decodedAfterCursor = getBookMarksQueryDto?.after
      ? decodeCursor(getBookMarksQueryDto.after)
      : null;

    const decodedBeforeCursor = getBookMarksQueryDto?.before
      ? decodeCursor(getBookMarksQueryDto.before)
      : null;

    let bookmarks: any[] = [];

    if (decodedAfterCursor) {
      bookmarks = await this.prismaService.bookMarks.findMany({
        where: {
          user_id: user.id,
        },
        orderBy: { saved_at: 'desc' },
        take: limit + 1,
        cursor: {
          id: decodedAfterCursor.id,
          saved_at: decodedAfterCursor.saved_at,
        },
        skip: 1,
      });
    } else if (decodedBeforeCursor) {
      bookmarks = await this.prismaService.bookMarks.findMany({
        where: {
          user_id: user.id,
        },
        orderBy: { saved_at: 'asc' },
        take: limit + 1,
        cursor: {
          id: decodedBeforeCursor.id,
          saved_at: decodedBeforeCursor.saved_at,
        },
        skip: 1,
      });

      bookmarks = bookmarks.reverse();
    } else {
      bookmarks = await this.prismaService.bookMarks.findMany({
        where: {
          user_id: user.id,
        },
        orderBy: { saved_at: 'desc' },
        take: limit + 1,
      });
    }

    const hasNextPage = bookmarks.length > limit;
    const items = hasNextPage ? bookmarks.slice(0, -1) : bookmarks;

    const nextCursor = hasNextPage
      ? encodeCursor({
          id: items[items.length - 1].id,
          saved_at: items[items.length - 1].saved_at,
        })
      : null;

    const prevCursor =
      items.length > 0
        ? encodeCursor({
            id: items[0].id,
            saved_at: items[0].saved_at,
          })
        : null;

    console.log('Next cursor: ', nextCursor);
    console.log('Prev cursor: ', prevCursor);

    return {
      data: await Promise.all(
        items.map(async (item) => this.getFormattedBookMark(item.id, user.id)),
      ),
      nextCursor,
      prevCursor,
    };
  };

  public deleteBookMarks = async (
    email: string,
    deleteBookMarksQueryDto: DeleteBookMarksQueryDto,
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

    const { postIds } = deleteBookMarksQueryDto;

    const bookMarkIds: string[] = [];

    await Promise.all(
      postIds.map(async (postId) => {
        const existingBookmark = await this.prismaService.bookMarks.findUnique({
          where: {
            user_id_post_id: {
              user_id: user.id,
              post_id: postId,
            },
          },
        });

        if (existingBookmark) {
          await this.prismaService.bookMarks.delete({
            where: {
              id: existingBookmark.id,
            },
          });

          bookMarkIds.push(existingBookmark.id);
        }
      }),
    );

    return {
      success: true,
      message: `Bookmark${postIds.length > 1 ? 's have' : ' has'} been deleted successfully.`,
      bookMarkIds,
    };
  };
}
