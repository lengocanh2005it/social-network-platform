import configuration from '@app/common/configs/configuration';
import { JwtGuard, RoleGuard } from '@app/common/guards';
import {
  LoggingInterceptor,
  PerformanceInterceptor,
  RpcToHttpExceptionInterceptor,
  UserActivityInterceptor,
} from '@app/common/interceptors';
import { KafkaModule, PrismaModule } from '@app/common/modules';
import {
  CloudfareProvider,
  HuggingFaceProvider,
  InfisicalProvider,
  KeycloakProvider,
  MetricsProviders,
  TwoFactorAuthProvider,
} from '@app/common/providers';
import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import {
  KeycloakConnectModule,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';
import { TwilioModule } from 'nestjs-twilio';
import { CommonService } from './common.service';
import { SentryModule } from '@sentry/nestjs/setup';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    KeycloakConnectModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        authServerUrl: configService.get<string>(
          'keycloak.auth_server_url',
          '',
        ),
        realm: configService.get<string>('keycloak.realm', ''),
        clientId: configService.get<string>('keycloak.client_id', ''),
        secret: configService.get<string>('keycloak.secret', ''),
        tokenValidation: TokenValidation.ONLINE,
        policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      }),
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    KafkaModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret_key', ''),
        signOptions: {
          expiresIn: configService.get<string>('jwt.access_token_life', ''),
        },
      }),
    }),
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        accountSid: configService.get<string>('twilio.account_sid', ''),
        authToken: configService.get<string>('twilio.auth_token', ''),
      }),
    }),
    PrometheusModule.register(),
    SentryModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  providers: [
    CommonService,
    InfisicalProvider,
    KeycloakProvider,
    JwtGuard,
    RoleGuard,
    TwoFactorAuthProvider,
    CloudfareProvider,
    HuggingFaceProvider,
    LoggingInterceptor,
    PerformanceInterceptor,
    ...MetricsProviders,
    RpcToHttpExceptionInterceptor,
    UserActivityInterceptor,
  ],
  exports: [
    ConfigModule,
    CommonService,
    KafkaModule,
    PrismaModule,
    HttpModule,
    KeycloakConnectModule,
    JwtModule,
    InfisicalProvider,
    KeycloakProvider,
    RoleGuard,
    JwtGuard,
    TwilioModule,
    TwoFactorAuthProvider,
    CloudfareProvider,
    HuggingFaceProvider,
    PrometheusModule,
    LoggingInterceptor,
    PerformanceInterceptor,
    ...MetricsProviders,
    SentryModule,
    UserActivityInterceptor,
    ScheduleModule,
  ],
})
export class CommonModule {}
