import {
  CreateBookMarkDto,
  DeleteBookMarksQueryDto,
  GetBookMarksQueryDto,
} from '@app/common/dtos/bookmarks';
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
import { PostMediaEnum } from '@app/common/utils';
import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostsService } from './posts.service';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @MessagePattern('create-post')
  async createPost(
    @Payload('email') email: string,
    @Payload('createPostDto') createPostDto: CreatePostDto,
  ) {
    return this.postsService.createPost(email, createPostDto);
  }

  @MessagePattern('get-profile-posts')
  async getProfilePosts(
    @Payload('user_id') user_id: string,
    @Payload('current_user_id') currentUserId: string,
    @Payload('getPostQueryDto') getPostQueryDto?: GetPostQueryDto,
  ) {
    return this.postsService.getProfilePosts(
      user_id,
      currentUserId,
      getPostQueryDto,
    );
  }

  @MessagePattern('get-home-posts')
  async getHomePosts(
    @Payload('email') email: string,
    @Payload('friendIds') friendIds: string[],
    @Payload('getPostQueryDto') getPostQueryDto?: GetPostQueryDto,
  ) {
    return this.postsService.getHomePosts(email, friendIds, getPostQueryDto);
  }

  @MessagePattern('delete-post')
  async deletePost(
    @Payload('postId') postId: string,
    @Payload('email') email: string,
  ) {
    return this.postsService.deletePost(postId, email);
  }

  @MessagePattern('update-post')
  async updatePost(
    @Payload('email') email: string,
    @Payload('postId') postId: string,
    @Payload('updatePostDto') updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(email, postId, updatePostDto);
  }

  @MessagePattern('like-post')
  async likePost(
    @Payload('email') email: string,
    @Payload('postId') postId: string,
  ) {
    return this.postsService.likePost(email, postId);
  }

  @MessagePattern('unlike-post')
  async unlikePost(
    @Payload('email') email: string,
    @Payload('postId') postId: string,
  ) {
    return this.postsService.unlikePost(email, postId);
  }

  @MessagePattern('get-likes')
  async getLikes(
    @Payload('email') email: string,
    @Payload('postId') postId: string,
    @Payload('getUserLikesQueryDto')
    getUserLikesQueryDto?: GetUserLikesQueryDto,
  ) {
    return this.postsService.getLikes(email, postId, getUserLikesQueryDto);
  }

  @MessagePattern('create-comment')
  async createComment(
    @Payload('email') email: string,
    @Payload('postId') postId: string,
    @Payload('createCommentDto') createCommentDto: CreateCommentDto,
  ) {
    return this.postsService.createComment(email, postId, createCommentDto);
  }

  @MessagePattern('get-comments')
  async getComments(
    @Payload('postId') postId: string,
    @Payload('email') email: string,
    @Payload('getCommentQueryDto') getCommentQueryDto?: GetPostQueryDto,
  ) {
    return this.postsService.getComments(postId, email, getCommentQueryDto);
  }

  @MessagePattern('delete-comment')
  async deleteComment(
    @Payload('email') email: string,
    @Payload('postId') postId: string,
    @Payload('commentId') commentId: string,
  ) {
    return this.postsService.deleteComment(postId, commentId, email);
  }

  @MessagePattern('create-comment-reply')
  async createCommentReply(
    @Payload('postId') postId: string,
    @Payload('commentId') commentId: string,
    @Payload('createCommentReplyDto')
    createCommentReplyDto: CreateCommentReplyDto,
    @Payload('email') email: string,
  ) {
    return this.postsService.createCommentReply(
      postId,
      commentId,
      createCommentReplyDto,
      email,
    );
  }

  @MessagePattern('get-comment-replies')
  async getCommentReplies(
    @Payload('postId') postId: string,
    @Payload('commentId') commentId: string,
    @Payload('email') email: string,
    @Payload('getCommentQueryDto') getCommentQueryDto?: GetPostQueryDto,
  ) {
    return this.postsService.getCommentReplies(
      postId,
      commentId,
      email,
      getCommentQueryDto,
    );
  }

  @MessagePattern('like-comment')
  async likeComment(
    @Payload('postId') postId: string,
    @Payload('commentId') commentId: string,
    @Payload('email') email: string,
  ) {
    return this.postsService.likeComment(postId, commentId, email);
  }

  @MessagePattern('unlike-comment')
  async unlikeComment(
    @Payload('postId') postId: string,
    @Payload('commentId') commentId: string,
    @Payload('email') email: string,
  ) {
    return this.postsService.unlikeComment(postId, commentId, email);
  }

  @MessagePattern('get-likes-comment')
  async getLikesOfComment(
    @Payload('postId') postId: string,
    @Payload('commentId') commentId: string,
    @Payload('getCommentLikeQueryDto')
    getCommentLikeQueryDto?: GetPostQueryDto,
  ) {
    return this.postsService.getLikesOfComment(
      postId,
      commentId,
      getCommentLikeQueryDto,
    );
  }

  @MessagePattern('create-post-share')
  async createPostShare(
    @Payload('postId') postId: string,
    @Payload('email') email: string,
    @Payload('createPostShareDto') createPostShareDto: CreatePostShareDto,
  ) {
    return this.postsService.createPostShare(postId, email, createPostShareDto);
  }

  @MessagePattern('get-media-post')
  async getMediaOfPost(
    @Payload('postId') postId: string,
    @Payload('mediaId') mediaId: string,
    @Payload('type') type: PostMediaEnum,
    @Payload('email') email: string,
  ) {
    return this.postsService.getMediaOfPost(postId, mediaId, type, email);
  }

  @MessagePattern('get-comments-media')
  async getCommentsMedia(
    @Payload('postId') postId: string,
    @Payload('mediaId') mediaId: string,
    @Payload('email') email: string,
    @Payload('getCommentsMediaQueryDto')
    getCommentsMediaQueryDto: GetCommentsMediaQueryDto,
  ) {
    return this.postsService.getCommentsMedia(
      postId,
      mediaId,
      email,
      getCommentsMediaQueryDto,
    );
  }

  @MessagePattern('like-media-post')
  async likeMediaOfPost(
    @Payload('postId') postId: string,
    @Payload('mediaId') mediaId: string,
    @Payload('email') email: string,
    @Payload('likePostMediaDto') likePostMediaDto: LikePostMediaDto,
  ) {
    return this.postsService.likeMediaOfPost(
      postId,
      mediaId,
      email,
      likePostMediaDto,
    );
  }

  @MessagePattern('unlike-media-post')
  async unlikeMediaOfPost(
    @Payload('postId') postId: string,
    @Payload('mediaId') mediaId: string,
    @Payload('email') email: string,
    @Payload('unlikeMediaPostQueryDto')
    unlikeMediaPostQueryDto: UnlikeMediaPostQueryDto,
  ) {
    return this.postsService.unlikeMediaOfPost(
      postId,
      mediaId,
      email,
      unlikeMediaPostQueryDto,
    );
  }

  @MessagePattern('get-post-of-user')
  async getPostOfUser(
    @Payload('postId') postId: string,
    @Payload('username') username: string,
    @Payload('email') email: string,
  ) {
    return this.postsService.getPostOfUser(postId, username, email);
  }

  @MessagePattern('get-tagged-users-of-post')
  async getTaggedUsersOfPost(
    @Payload('postId', ParseUUIDPipe) postId: string,
    @Payload('userId') userId: string,
    @Payload('getTaggedUsersQueryDto')
    getTaggedUsersQueryDto?: GetTaggedUsersQueryDto,
  ) {
    return this.postsService.getTaggedUsersOfPost(
      postId,
      userId,
      getTaggedUsersQueryDto,
    );
  }

  @MessagePattern('create-bookmark')
  async createBookmark(
    @Payload('email') email: string,
    @Payload('createBookMarkDto') createBookMarkDto: CreateBookMarkDto,
  ) {
    return this.postsService.createBookmark(email, createBookMarkDto);
  }

  @MessagePattern('get-bookmarks')
  async getBookmarks(
    @Payload('email') email: string,
    @Payload('getBookMarksQueryDto')
    getBookMarksQueryDto: GetBookMarksQueryDto,
  ) {
    const response = await this.postsService.getBookmarks(
      email,
      getBookMarksQueryDto,
    );

    return response;
  }

  @MessagePattern('delete-bookmarks')
  async deleteBookMarks(
    @Payload('email') email: string,
    @Payload('deleteBookMarksQueryDto')
    deleteBookMarksQueryDto: DeleteBookMarksQueryDto,
  ) {
    return this.postsService.deleteBookMarks(email, deleteBookMarksQueryDto);
  }
}
