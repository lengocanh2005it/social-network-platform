import { KAFKA_SERVICES } from '@app/common/utils';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync(
      KAFKA_SERVICES.map(({ serviceName, clientId, groupId }) => ({
        name: serviceName,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId,
              brokers: configService
                .get<string>('kafka.brokers')
                ?.split(',') || ['localhost:9092'],
            },
            consumer: {
              groupId,
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner,
            },
          },
        }),
      })),
    ),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
