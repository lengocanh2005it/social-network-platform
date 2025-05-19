import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
