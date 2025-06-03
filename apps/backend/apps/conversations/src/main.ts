import { NestFactory } from '@nestjs/core';
import { ConversationsModule } from './conversations.module';

async function bootstrap() {
  const app = await NestFactory.create(ConversationsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
