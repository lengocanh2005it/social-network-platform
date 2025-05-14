import { InfisicalSDK } from '@infisical/sdk';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InfisicalProvider implements OnModuleInit {
  private client: InfisicalSDK;
  private projectId: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const clientId = this.configService.get<string>('infisical.client_id', '');

    const clientSecret = this.configService.get<string>(
      'infisical.client_secret',
      '',
    );

    this.projectId = this.configService.get<string>('infisical.project_id', '');

    this.client = new InfisicalSDK({
      siteUrl: this.configService.get<string>(
        'infisical.infisical_site_url',
        '',
      ),
    });

    try {
      await this.client.auth().universalAuth.login({
        clientId,
        clientSecret,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async getSecret(
    secretName: string,
    environment = 'dev',
  ): Promise<string | null> {
    try {
      const secret = await this.client.secrets().getSecret({
        environment,
        projectId: this.projectId,
        secretName,
        viewSecretValue: true,
      });

      return secret.secretValue ?? null;
    } catch (error) {
      console.error(`❌ Error getting "${secretName}":`, error);
      return null;
    }
  }

  async setSecret(
    secretName: string,
    secretValue: string,
    environment = 'dev',
    secretComment?: string,
  ): Promise<void> {
    try {
      await this.client.secrets().createSecret(secretName, {
        environment,
        projectId: this.projectId,
        secretValue,
        secretComment,
      });
    } catch (error: any) {
      const message = error?.message || '';

      if (message.includes('Secret already exist')) {
        try {
          await this.client.secrets().updateSecret(secretName, {
            environment,
            projectId: this.projectId,
            secretValue,
            secretComment,
          });
        } catch (updateError) {
          console.error(`❌ Failed to update "${secretName}":`, updateError);

          throw updateError;
        }
      } else {
        console.error(`❌ Error saving "${secretName}":`, error);

        throw error;
      }
    }
  }

  async deleteSecret(secretName: string, environment = 'dev'): Promise<void> {
    try {
      await this.client.secrets().deleteSecret(secretName, {
        environment,
        projectId: this.projectId,
      });
    } catch (error) {
      console.error(`❌ Error deleting "${secretName}":`, error);
    }
  }
}
