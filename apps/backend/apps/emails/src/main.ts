import { generateKafkaServiceMap, KAFKA_SERVICES } from '@app/common/utils';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EmailsModule } from './emails.module';
import { Partitioners } from 'kafkajs';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(EmailsModule);

  const configService = appContext.get(ConfigService);

  const kafkaBrokers = configService
    .get<string>('kafka.brokers', 'localhost:9092')
    ?.split(',');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EmailsModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId:
            generateKafkaServiceMap(KAFKA_SERVICES)['EMAILS_SERVICE'].clientId,
          brokers: kafkaBrokers,
        },
        consumer: {
          groupId:
            generateKafkaServiceMap(KAFKA_SERVICES)['EMAILS_SERVICE'].groupId,
        },
        producer: {
          createPartitioner: Partitioners.LegacyPartitioner,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
