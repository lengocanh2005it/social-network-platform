import {
  CreateCommentDto,
  CreateCommentReplyDto,
  CreatePostDto,
  CreatePostShareDto,
  GetCommentsMediaQueryDto,
  GetMediaPostQueryDto,
  GetPostQueryDto,
  GetUserLikesQueryDto,
  LikePostMediaDto,
  UnlikeMediaPostQueryDto,
  UpdatePostDto,
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
    @Query() getCommentQueryDto?: GetPostQueryDto,
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
    @Query() getCommentReplyQueryDto?: GetPostQueryDto,
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
    @Query() getCommentLikeQueryDto?: GetPostQueryDto,
  ) {
    return this.postsService.getLikesOfComment(
      postId,
      commentId,
      getCommentLikeQueryDto,
    );
  }

  @Post(':id/share')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async createPostShare(
    @Param('id', ParseUUIDPipe) postId: string,
    @Body() createPostShareDto: CreatePostShareDto,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.createPostShare(postId, email, createPostShareDto);
  }

  @Get(':id/media/:mediaId')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getMediaOfPost(
    @Param('id', ParseUUIDPipe) postId: string,
    @Param('mediaId') mediaId: string,
    @Query() getMediaPostQueryDto: GetMediaPostQueryDto,
    @KeycloakUser() user: any,
  ) {
    const { type } = getMediaPostQueryDto;

    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.getMediaOfPost(postId, mediaId, type, email);
  }

  @Get(':id/media/:mediaId/comments')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getCommentsOfMedia(
    @Param('id', ParseUUIDPipe) postId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @KeycloakUser() user: any,
    @Query() getCommentMediaQueryDto: GetCommentsMediaQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.getCommentsOfMedia(
      postId,
      mediaId,
      email,
      getCommentMediaQueryDto,
    );
  }

  @Post(':id/media/:mediaId/like')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async likeMediaOfPost(
    @Param('id', ParseUUIDPipe) postId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @KeycloakUser() user: any,
    @Body() likePostMediaDto: LikePostMediaDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.likeMediaOfPost(
      postId,
      mediaId,
      email,
      likePostMediaDto,
    );
  }

  @Delete(':id/media/:mediaId/like')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async unlikeMediaOfPost(
    @Param('id', ParseUUIDPipe) postId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @KeycloakUser() user: any,
    @Query() unlikePostMediaQueryDto: UnlikeMediaPostQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.unlikeMediaOfPost(
      postId,
      mediaId,
      email,
      unlikePostMediaQueryDto,
    );
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getPostOfUser(
    @Param('id', ParseUUIDPipe) postId: string,
    @Query('username') username: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.postsService.getPostOfUser(postId, username, email);
  }
}
