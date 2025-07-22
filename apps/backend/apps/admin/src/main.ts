import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin.module';
import '../../../libs/common/src/configs/sentry.config';

async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
