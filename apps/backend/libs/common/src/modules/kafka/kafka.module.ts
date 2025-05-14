import { createKafkaOptions } from '@app/common/configs';
import { KAFKA_SERVICES } from '@app/common/utils';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync(
      KAFKA_SERVICES.map(({ serviceName, clientId, groupId }) => ({
        name: serviceName,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) =>
          createKafkaOptions(configService, clientId, groupId),
      })),
    ),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
