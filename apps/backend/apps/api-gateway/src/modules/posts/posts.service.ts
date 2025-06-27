import {
  CreateCommentDto,
  CreateCommentReplyDto,
  CreatePostDto,
  CreatePostShareDto,
  GetCommentsMediaQueryDto,
  GetPostQueryDto,
  GetTaggedUsersQueryDto,
  GetUserLikesQueryDto,
  LikePostMediaDto,
  UnlikeMediaPostQueryDto,
  UpdatePostDto,
} from '@app/common/dtos/posts';
import { PostMediaEnum, sendWithTimeout, toPlain } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

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
      'create-post-share',
      'get-comments-media',
      'get-media-post',
      'unlike-media-post',
      'like-media-post',
      'get-post-of-user',
      'get-tagged-users-of-post',
    ];

    patterns.forEach((pattern) =>
      this.postsClient.subscribeToResponseOf(pattern),
    );

    this.usersClient.subscribeToResponseOf('get-friends');
    this.usersClient.subscribeToResponseOf('get-user-by-field');
  }

  public createPost = async (email: string, createPostDto: CreatePostDto) => {
    return sendWithTimeout(this.postsClient, 'create-post', {
      email,
      createPostDto: toPlain(createPostDto),
    });
  };

  public deletePost = async (postId: string, email: string) => {
    return sendWithTimeout(this.postsClient, 'delete-post', {
      postId,
      email,
    });
  };

  public updatePost = async (
    postId: string,
    updatePostDto: UpdatePostDto,
    email: string,
  ) => {
    return sendWithTimeout(this.postsClient, 'update-post', {
      postId,
      email,
      updatePostDto: toPlain(updatePostDto),
    });
  };

  public getPosts = async (
    email: string,
    getPostQueryDto?: GetPostQueryDto,
  ) => {
    const friendIds = await sendWithTimeout<string[]>(
      this.usersClient,
      'get-friends',
      {
        email,
      },
    );

    return sendWithTimeout(this.postsClient, 'get-home-posts', {
      email,
      getPostQueryDto: toPlain(getPostQueryDto),
      friendIds,
    });
  };

  public likePost = async (email: string, postId: string) => {
    return sendWithTimeout(this.postsClient, 'like-post', {
      email,
      postId,
    });
  };

  public unlikePost = async (email: string, postId: string) => {
    return sendWithTimeout(this.postsClient, 'unlike-post', {
      email,
      postId,
    });
  };

  public getLikes = async (
    email: string,
    postId: string,
    getUserLikesQueryDto?: GetUserLikesQueryDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'get-likes', {
      email,
      postId,
      getUserLikesQueryDto: toPlain(getUserLikesQueryDto),
    });
  };

  public createComment = async (
    email: string,
    postId: string,
    createCommentDto: CreateCommentDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'create-comment', {
      email,
      postId,
      createCommentDto: toPlain(createCommentDto),
    });
  };

  public getComments = async (
    postId: string,
    email: string,
    getCommentQueryDto?: GetPostQueryDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'get-comments', {
      postId,
      email,
      getCommentQueryDto,
    });
  };

  public deleteComment = async (
    postId: string,
    commentId: string,
    email: string,
  ) => {
    return sendWithTimeout(this.postsClient, 'delete-comment', {
      postId,
      commentId,
      email,
    });
  };

  public createCommentReply = async (
    postId: string,
    commentId: string,
    createCommentReplyDto: CreateCommentReplyDto,
    email: string,
  ) => {
    return sendWithTimeout(this.postsClient, 'create-comment-reply', {
      postId,
      commentId,
      createCommentReplyDto: toPlain(createCommentReplyDto),
      email,
    });
  };

  public getCommentReplies = async (
    postId: string,
    commentId: string,
    email: string,
    getCommentQueryDto?: GetPostQueryDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'get-comment-replies', {
      postId,
      commentId,
      email,
      getCommentQueryDto: toPlain(getCommentQueryDto),
    });
  };

  public likeComment = async (
    postId: string,
    commentId: string,
    email: string,
  ) => {
    return sendWithTimeout(this.postsClient, 'like-comment', {
      postId,
      commentId,
      email,
    });
  };

  public unlikeComment = async (
    postId: string,
    commentId: string,
    email: string,
  ) => {
    return sendWithTimeout(this.postsClient, 'unlike-comment', {
      postId,
      commentId,
      email,
    });
  };

  public getLikesOfComment = async (
    postId: string,
    commentId: string,
    getCommentLikeQueryDto?: GetPostQueryDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'get-likes-comment', {
      postId,
      commentId,
      getCommentLikeQueryDto: toPlain(getCommentLikeQueryDto),
    });
  };

  public createPostShare = async (
    postId: string,
    email: string,
    createPostShareDto: CreatePostShareDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'create-post-share', {
      postId,
      email,
      createPostShareDto: toPlain(createPostShareDto),
    });
  };

  public getMediaOfPost = async (
    postId: string,
    mediaId: string,
    type: PostMediaEnum,
    email: string,
  ) => {
    return sendWithTimeout(this.postsClient, 'get-media-post', {
      mediaId,
      postId,
      type,
      email,
    });
  };

  public getCommentsOfMedia = async (
    postId: string,
    mediaId: string,
    email: string,
    getCommentsMediaQueryDto: GetCommentsMediaQueryDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'get-comments-media', {
      postId,
      mediaId,
      email,
      getCommentsMediaQueryDto: toPlain(getCommentsMediaQueryDto),
    });
  };

  public likeMediaOfPost = async (
    postId: string,
    mediaId: string,
    email: string,
    likePostMediaDto: LikePostMediaDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'like-media-post', {
      postId,
      mediaId,
      email,
      likePostMediaDto: toPlain(likePostMediaDto),
    });
  };

  public unlikeMediaOfPost = async (
    postId: string,
    mediaId: string,
    email: string,
    unlikeMediaPostQueryDto: UnlikeMediaPostQueryDto,
  ) => {
    return sendWithTimeout(this.postsClient, 'unlike-media-post', {
      postId,
      mediaId,
      email,
      unlikeMediaPostQueryDto: toPlain(unlikeMediaPostQueryDto),
    });
  };

  public getPostOfUser = async (
    postId: string,
    username: string,
    email: string,
  ) => {
    return sendWithTimeout(this.postsClient, 'get-post-of-user', {
      postId,
      username,
      email,
    });
  };

  public getTaggedUsersOfPost = async (
    postId: string,
    email: string,
    getTaggedUsersQueryDto?: GetTaggedUsersQueryDto,
  ) => {
    const payload = {
      field: 'email',
      value: email,
    };

    const user = await sendWithTimeout(
      this.usersClient,
      'get-user-by-field',
      JSON.stringify(payload),
    );

    return sendWithTimeout(this.postsClient, 'get-tagged-users-of-post', {
      postId,
      userId: user.id,
      getTaggedUsersQueryDto: toPlain(getTaggedUsersQueryDto),
    });
  };
}
