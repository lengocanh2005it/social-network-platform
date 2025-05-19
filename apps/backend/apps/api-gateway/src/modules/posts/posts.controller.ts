import { CreatePostDto, UpdatePostDto } from '@app/common/dtos/posts';
import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
}
