import {
  CreatePostDto,
  GetPostQueryDto,
  UpdatePostDto,
} from '@app/common/dtos/posts';
import { Controller } from '@nestjs/common';
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
    @Payload('getPostQueryDto') getPostQueryDto?: GetPostQueryDto,
  ) {
    return this.postsService.getProfilePosts(user_id, getPostQueryDto);
  }

  @MessagePattern('get-home-posts')
  async getHomePosts(
    @Payload('user_id') user_id: string,
    @Payload('friendIds') friendIds: string[],
    @Payload('getPostQueryDto') getPostQueryDto?: GetPostQueryDto,
  ) {
    return this.postsService.getHomePosts(user_id, friendIds, getPostQueryDto);
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
}
