import { HttpExceptionFilter } from '@app/common/filters';
import {
  LoggingInterceptor,
  PerformanceInterceptor,
  RpcToHttpExceptionInterceptor,
} from '@app/common/interceptors';
import { KeycloakProvider } from '@app/common/providers';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import '../../../libs/common/src/configs/sentry.config';
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
  const performanceInterceptor = app.get(PerformanceInterceptor);

  app.useGlobalInterceptors(
    loggingInterceptor,
    performanceInterceptor,
    new RpcToHttpExceptionInterceptor(),
  );

  const keycloakProvider = app.get(KeycloakProvider);

  app.useGlobalFilters(new HttpExceptionFilter(keycloakProvider));

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
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
