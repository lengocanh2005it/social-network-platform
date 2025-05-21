import {
  CreatePostDto,
  CreatePostImageDto,
  CreatePostVideoDto,
  GetPostQueryDto,
  UpdatePostDto,
} from '@app/common/dtos/posts';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { HuggingFaceProvider } from '@app/common/providers';
import { decodeCursor, encodeCursor, isToxic } from '@app/common/utils';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { PostPrivaciesEnum, UsersType } from '@repo/db';
import { pick } from 'lodash';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PostsService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientKafka,
    private readonly huggingFaceProvider: HuggingFaceProvider,
  ) {}

  onModuleInit() {
    const postPatterns = ['get-me', 'get-user-by-field'];

    postPatterns.forEach((pp) => this.usersClient.subscribeToResponseOf(pp));
  }

  public getProfilePosts = async (
    user_id: string,
    getPostQueryDto?: GetPostQueryDto,
  ) => {
    const limit = getPostQueryDto?.limit ?? 10;

    const decodedCursor = getPostQueryDto?.after
      ? decodeCursor(getPostQueryDto.after)
      : null;

    const posts = await this.prismaService.posts.findMany({
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
      },
    });

    const hasNextPage = posts.length > limit;

    const items = hasNextPage ? posts.slice(0, -1) : posts;

    return {
      data: items.map((item) => this.transformPostItem(item)),
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

    const limit = getPostQueryDto?.limit ?? 1;

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
      },
    });

    const hasNextPage = posts.length > limit;

    const items = hasNextPage ? posts.slice(0, -1) : posts;

    return {
      data: items.map((item) => this.transformPostItem(item)),
      nextCursor: hasNextPage ? encodeCursor(items[items.length - 1].id) : null,
    };
  };

  public createPost = async (email: string, createPostDto: CreatePostDto) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send('get-me', {
        email,
      }),
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
            newPost.id,
            content,
          ),
        ),
      );

    await this.createMediaOfPost(newPost.id, images, videos);

    if (tags?.length) await this.createPostTags(tags, newPost.id);

    if (hashtags?.length) await this.createPostHashTags(hashtags, newPost.id);

    return this.getFormattedPost(newPost.id);
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
    await this.verifyModifyPost(email, postId);

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

      await this.createPostTags(tags, postId);
    }

    if (hashtags?.length) {
      await this.prismaService.postHashTags.deleteMany({
        where: {
          post_id: postId,
        },
      });

      await this.createPostHashTags(hashtags, postId);
    }

    await this.createMediaOfPost(postId, images, videos);

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

    return this.getFormattedPost(postId);
  };

  private createMediaOfPost = async (
    postId: string,
    images?: CreatePostImageDto[],
    videos?: CreatePostVideoDto[],
  ) => {
    if (images?.length)
      await Promise.all(
        images.map((image) =>
          this.createPostRelation(this.prismaService.postImages, postId, image),
        ),
      );

    if (videos?.length)
      await Promise.all(
        videos.map((video) =>
          this.createPostRelation(this.prismaService.postVideos, postId, video),
        ),
      );
  };

  private getFormattedPost = async (postId: string) => {
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
      },
    });

    return this.transformPostItem(item);
  };

  private verifyModifyPost = async (email: string, postId: string) => {
    const user = await firstValueFrom(
      this.usersClient.send('get-me', {
        email,
      }),
    );

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

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
        message: `The post you're trying to delete could not be found.`,
      });

    if (email !== post.user.email)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You're not authorized to modify this post.`,
      });
  };

  private createPostRelation = async <T>(
    model: { create: (args: { data: any }) => Promise<T> },
    post_id: string,
    dto: any,
  ): Promise<T> => {
    return model.create({
      data: {
        ...dto,
        post: {
          connect: { id: post_id },
        },
      },
    });
  };

  private createPostTags = async (tags: string[], post_id: string) => {
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

  private transformPostItem(item: any) {
    return {
      ...item,
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
      ),
    };
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
}
