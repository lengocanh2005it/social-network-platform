import { CommonModule } from '@app/common';
import { RedisPubSubProvider } from '@app/common/providers';
import { Global, Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { SseService } from './sse.service';

@Global()
@Module({
  imports: [CommonModule],
  controllers: [SseController],
  providers: [SseService, RedisPubSubProvider],
  exports: [SseService],
})
export class SseModule {}
