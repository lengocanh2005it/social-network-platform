import configuration from '@app/common/config/configuration';
import { JwtGuard, RoleGuard } from '@app/common/guards';
import { KafkaModule, PrismaModule } from '@app/common/modules';
import { InfisicalProvider, KeycloakProvider } from '@app/common/providers';
import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  KeycloakConnectModule,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';
import { CommonService } from './common.service';

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
  ],
  providers: [
    CommonService,
    InfisicalProvider,
    KeycloakProvider,
    JwtGuard,
    RoleGuard,
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
  ],
})
export class CommonModule {}
