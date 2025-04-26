import { CommonModule } from '@app/common';
import { Module } from '@nestjs/common';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';

@Module({
  imports: [CommonModule],
  controllers: [RedisController],
  providers: [RedisService],
})
export class RedisModule {}
