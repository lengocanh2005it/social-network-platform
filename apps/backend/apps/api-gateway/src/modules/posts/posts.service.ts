import {
  CreateCommentDto,
  CreateCommentReplyDto,
  CreatePostDto,
  GetCommentQueryDto,
  GetPostQueryDto,
  GetUserLikesQueryDto,
  UpdatePostDto,
  GetCommentLikeQueryDto,
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
      'like-post',
      'unlike-post',
      'get-likes',
      'create-comment',
      'get-comments',
      'delete-comment',
      'create-comment-reply',
      'get-comment-replies',
      'like-comment',
      'unlike-comment',
      'get-likes-comment',
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

    return firstValueFrom(
      this.postsClient.send('get-home-posts', {
        email,
        getPostQueryDto,
        friendIds,
      }),
    );
  };

  public likePost = async (email: string, postId: string) => {
    return firstValueFrom(
      this.postsClient.send('like-post', { email, postId }),
    );
  };

  public unlikePost = async (email: string, postId: string) => {
    return firstValueFrom(
      this.postsClient.send('unlike-post', {
        email,
        postId,
      }),
    );
  };

  public getLikes = async (
    email: string,
    postId: string,
    getUserLikesQueryDto?: GetUserLikesQueryDto,
  ) => {
    return firstValueFrom(
      this.postsClient.send('get-likes', {
        email,
        postId,
        getUserLikesQueryDto,
      }),
    );
  };

  public createComment = async (
    email: string,
    postId: string,
    createCommentDto: CreateCommentDto,
  ) => {
    return firstValueFrom(
      this.postsClient.send('create-comment', {
        email,
        postId,
        createCommentDto,
      }),
    );
  };

  public getComments = async (
    postId: string,
    email: string,
    getCommentQueryDto?: GetCommentQueryDto,
  ) => {
    return firstValueFrom(
      this.postsClient.send('get-comments', {
        postId,
        email,
        getCommentQueryDto,
      }),
    );
  };

  public deleteComment = async (
    postId: string,
    commentId: string,
    email: string,
  ) => {
    return firstValueFrom(
      this.postsClient.send('delete-comment', {
        postId,
        commentId,
        email,
      }),
    );
  };

  public createCommentReply = async (
    postId: string,
    commentId: string,
    createCommentReplyDto: CreateCommentReplyDto,
    email: string,
  ) => {
    return firstValueFrom(
      this.postsClient.send('create-comment-reply', {
        postId,
        commentId,
        createCommentReplyDto,
        email,
      }),
    );
  };

  public getCommentReplies = async (
    postId: string,
    commentId: string,
    email: string,
    getCommentQueryDto?: GetCommentQueryDto,
  ) => {
    return firstValueFrom(
      this.postsClient.send('get-comment-replies', {
        postId,
        commentId,
        email,
        getCommentQueryDto,
      }),
    );
  };

  public likeComment = async (
    postId: string,
    commentId: string,
    email: string,
  ) => {
    return firstValueFrom(
      this.postsClient.send('like-comment', {
        postId,
        commentId,
        email,
      }),
    );
  };

  public unlikeComment = async (
    postId: string,
    commentId: string,
    email: string,
  ) => {
    return firstValueFrom(
      this.postsClient.send('unlike-comment', {
        postId,
        commentId,
        email,
      }),
    );
  };

  public getLikesOfComment = async (
    postId: string,
    commentId: string,
    getCommentLikeQueryDto?: GetCommentLikeQueryDto,
  ) => {
    return firstValueFrom(
      this.postsClient.send('get-likes-comment', {
        postId,
        commentId,
        getCommentLikeQueryDto,
      }),
    );
  };
}
