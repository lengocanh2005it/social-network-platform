import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StoryStatusEnum } from '@repo/db';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expireStories() {
    const result = await this.prismaService.stories.updateMany({
      where: {
        expires_at: { lt: new Date() },
        status: StoryStatusEnum.active,
      },
      data: {
        status: StoryStatusEnum.expired,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} stories.`);
    }
  }
}
