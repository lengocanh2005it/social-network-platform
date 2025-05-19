import { CommonModule } from '@app/common';
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [CommonModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
