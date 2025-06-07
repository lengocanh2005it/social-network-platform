import { Module } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}
