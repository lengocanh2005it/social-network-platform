import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configurations from './config/configurations';
import { AuthModule } from './modules/auth/auth.module';
import { KafkaModule } from './modules/kafka/kafka.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configurations],
    }),
    KafkaModule,
    AuthModule,
    UsersModule,
    PrismaModule,
  ],
})
export class AppModule {}
