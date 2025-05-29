import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  providers: [FriendsService],
  controllers: [FriendsController],
})
export class FriendsModule {}
