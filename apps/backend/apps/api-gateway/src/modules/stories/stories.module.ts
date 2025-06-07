import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  providers: [StoriesService],
  controllers: [StoriesController],
})
export class StoriesModule {}
