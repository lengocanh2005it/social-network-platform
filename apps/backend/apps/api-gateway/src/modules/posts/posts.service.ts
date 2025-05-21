import {
  CreatePostDto,
  GetPostQueryDto,
  UpdatePostDto,
} from '@app/common/dtos/posts';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PostsService implements OnModuleInit {
  constructor(
    @Inject('POSTS_SERVICE') private readonly postsClient: ClientKafka,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'create-post',
      'delete-post',
      'update-post',
      'get-home-posts',
    ];

    patterns.forEach((pattern) =>
      this.postsClient.subscribeToResponseOf(pattern),
    );

    this.usersClient.subscribeToResponseOf('get-friends');
  }

  public createPost = async (email: string, createPostDto: CreatePostDto) => {
    return firstValueFrom(
      this.postsClient.send('create-post', {
        email,
        createPostDto,
      }),
    );
  };

  public deletePost = async (postId: string, email: string) => {
    return firstValueFrom(
      this.postsClient.send('delete-post', {
        postId,
        email,
      }),
    );
  };

  public updatePost = async (
    postId: string,
    updatePostDto: UpdatePostDto,
    email: string,
  ) => {
    return firstValueFrom(
      this.postsClient.send('update-post', {
        postId,
        email,
        updatePostDto,
      }),
    );
  };

  public getPosts = async (
    email: string,
    getPostQueryDto?: GetPostQueryDto,
  ) => {
    const friendIds = await firstValueFrom<string[]>(
      this.usersClient.send('get-friends', {
        email,
      }),
    );

    console.log(friendIds);

    return firstValueFrom(
      this.postsClient.send('get-home-posts', {
        email,
        getPostQueryDto,
        friendIds,
      }),
    );
  };
}
