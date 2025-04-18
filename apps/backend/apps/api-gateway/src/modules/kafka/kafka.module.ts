import { KAFKA_USER_CLIENT_ID, KAFKA_USER_GROUP_ID } from '@app/common/utils';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: configService.get<string>(KAFKA_USER_CLIENT_ID, ''),
              brokers: configService.get<string[]>('kafka.brokers', []),
              ssl: true,
              sasl: {
                mechanism: 'plain',
                username: configService.get<string>('kafka.username', ''),
                password: configService.get<string>('kafka.password', ''),
              },
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner,
            },
            consumer: {
              groupId: configService.get<string>(KAFKA_USER_GROUP_ID, ''),
            },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
