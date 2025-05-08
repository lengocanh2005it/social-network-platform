import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as jwksClient from 'jwks-rsa';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KeycloakProvider {
  private client: jwksClient.JwksClient;
  private keyCloakUrl: string;
  private keyCloakRealm: string;
  private clientId: string;
  private clientSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {
    this.keyCloakUrl = this.configService.get<string>(
      'keycloak.auth_server_url',
      '',
    );
    this.keyCloakRealm = this.configService.get<string>('keycloak.realm', '');
    this.clientId = this.configService.get<string>('keycloak.client_id', '');
    this.clientSecret = this.configService.get<string>('keycloak.secret', '');

    const keyCloakUrl = this.configService.get<string>(
      'keycloak.auth_server_url',
      '',
    );

    const keyCloakRealm = this.configService.get<string>('keycloak.realm', '');

    this.client = jwksClient({
      jwksUri: `${keyCloakUrl}/realms/${keyCloakRealm}/protocol/openid-connect/certs`,
    });
  }

  public async verifyToken(token: string): Promise<any> {
    const decodedHeader = this.jwtService.decode(token, { complete: true });

    if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `You have submitted a token with an invalid header. Please check and try again.`,
      });

    const key = await this.client.getSigningKey(decodedHeader.header.kid);

    const publicKey = key.getPublicKey();

    return this.jwtService.verifyAsync(token, {
      secret: publicKey,
      algorithms: ['RS256'],
    });
  }

  public async refreshToken(refreshToken: string): Promise<any> {
    const tokenUrl = `${this.keyCloakUrl}/realms/${this.keyCloakRealm}/protocol/openid-connect/token`;

    const payload = new URLSearchParams();

    payload.append('grant_type', 'refresh_token');
    payload.append('client_id', this.clientId);
    payload.append('refresh_token', refreshToken);
    payload.append('client_secret', this.clientSecret);

    try {
      const response = await firstValueFrom<any>(
        this.httpService.post(tokenUrl, payload, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      return {
        ...response.data,
        role: await this.getRolesKeycloak(response?.data?.access_token),
      };
    } catch (err) {
      console.error(err);

      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Refresh token is invalid or expired.',
      });
    }
  }

  public getRolesKeycloak = async (access_token: string): Promise<any> => {
    try {
      const payload: any = await this.verifyToken(access_token);

      return payload?.resource_access?.[this.clientId]?.roles[0] || null;
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
  };
}
