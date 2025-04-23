import { CommonModule } from '@app/common';
import { EMAILS_QUEUE_NAME } from '@app/common/utils';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { EmailProcessor } from 'apps/emails/src/processors';
import { EmailsProducer } from 'apps/emails/src/producers';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('mailer.host', ''),
          port: configService.get<number>('mailer.port', 587),
          secure: false,
          auth: {
            user: configService.get<string>('mailer.user', ''),
            pass: configService.get<string>('mailer.pass', ''),
          },
        },
        defaults: {
          from: 'Social Network Platform Support <socialnetworksupport@gmail.com>',
        },
        template: {
          dir: join(process.cwd(), 'apps', 'emails', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('redis_url', 'redis://localhost:6379'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: EMAILS_QUEUE_NAME,
    }),
    CommonModule,
  ],
  controllers: [EmailsController],
  providers: [EmailsService, EmailProcessor, EmailsProducer],
})
export class EmailsModule {}
