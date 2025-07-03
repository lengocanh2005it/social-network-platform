import {
  LoggingInterceptor,
  PerformanceInterceptor,
} from '@app/common/interceptors';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('frontend_url', ''),
    credentials: true,
  });

  const loggingInterceptor = app.get(LoggingInterceptor);
  app.useGlobalInterceptors(loggingInterceptor);

  const performanceInterceptor = app.get(PerformanceInterceptor);
  app.useGlobalInterceptors(performanceInterceptor);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  const PORT = configService.get<number>('port', 3001);

  await app.startAllMicroservices();

  await app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
}
bootstrap().catch((err) => {
  console.error(err);
});
