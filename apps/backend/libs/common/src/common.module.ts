import configuration from '@app/common/config/configuration';
import { KafkaModule, PrismaModule } from '@app/common/modules';
import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
  ],
  providers: [CommonService],
  exports: [
    ConfigModule,
    CommonService,
    KafkaModule,
    PrismaModule,
    HttpModule,
    KeycloakConnectModule,
  ],
})
export class CommonModule {}
