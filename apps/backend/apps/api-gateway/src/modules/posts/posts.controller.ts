import {
  CreateCommentDto,
  CreateCommentReplyDto,
  CreatePostDto,
  GetCommentQueryDto,
  GetCommentReplyQueryDto,
  GetPostQueryDto,
  GetUserLikesQueryDto,
  UpdatePostDto,
  GetCommentLikeQueryDto,
} from '@app/common/dtos/posts';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleEnum } from '@repo/db';
import { KeycloakUser, Roles } from 'nest-keycloak-connect';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.user)
  async createPost(
    @KeycloakUser() user: any,
    @Body() createPostDto: CreatePostDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.createPost(email, createPostDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async deletePost(
    @Param('id', ParseUUIDPipe) id: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.deletePost(id, email);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async updatePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.updatePost(id, updatePostDto, email);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getPosts(
    @KeycloakUser() user: any,
    @Query() getPostQueryDto?: GetPostQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.getPosts(email, getPostQueryDto);
  }

  @Post(':id/like')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async likePost(
    @KeycloakUser() user: any,
    @Param('id', ParseUUIDPipe)
    postId: string,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.likePost(email, postId);
  }

  @Delete(':id/like')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async unlikePost(@KeycloakUser() user: any, @Param('id') postId: string) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.unlikePost(email, postId);
  }

  @Get(':id/likes')
  async getLikes(
    @KeycloakUser() user: any,
    @Param('id') postId: string,
    @Query() getUserLikesQueryDto?: GetUserLikesQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.getLikes(email, postId, getUserLikesQueryDto);
  }

  @Post('/:id/comment')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async createComment(
    @KeycloakUser() user: any,
    @Param('id', ParseUUIDPipe) postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.createComment(email, postId, createCommentDto);
  }

  @Get(':id/comments')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getComments(
    @Param('id', ParseUUIDPipe) postId: string,
    @KeycloakUser() user: any,
    @Query() getCommentQueryDto?: GetCommentQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.getComments(postId, email, getCommentQueryDto);
  }

  @Delete(':id/comments/:commentId')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async deleteComment(
    @Param('id', ParseUUIDPipe) postId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.deleteComment(postId, commentId, email);
  }

  @Post(':id/comments/:commentId/reply')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async createCommentReply(
    @Body() createCommentReplyDto: CreateCommentReplyDto,
    @Param('id') postId: string,
    @Param('commentId') commentId: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.createCommentReply(
      postId,
      commentId,
      createCommentReplyDto,
      email,
    );
  }

  @Get(':id/comments/:commentId/replies')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getCommentReplies(
    @Param('id') postId: string,
    @Param('commentId') commentId: string,
    @KeycloakUser() user: any,
    @Query() getCommentReplyQueryDto?: GetCommentReplyQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.getCommentReplies(
      postId,
      commentId,
      email,
      getCommentReplyQueryDto,
    );
  }

  @Post(':id/comments/:commentId/like')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async likeComment(
    @Param('id', ParseUUIDPipe) postId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.likeComment(postId, commentId, email);
  }

  @Delete(':id/comments/:commentId/like')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async unlikeComment(
    @Param('id', ParseUUIDPipe) postId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.unlikeComment(postId, commentId, email);
  }

  @Get(':id/comments/:commentId/likes')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getLikesOfComment(
    @Param('id') postId: string,
    @Param('commentId') commentId: string,
    @Query() getCommentLikeQueryDto?: GetCommentLikeQueryDto,
  ) {
    return this.postsService.getLikesOfComment(
      postId,
      commentId,
      getCommentLikeQueryDto,
    );
  }
}
