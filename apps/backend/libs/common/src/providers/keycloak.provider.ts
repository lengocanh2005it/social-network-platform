import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class KeycloakProvider {
  private client: jwksClient.JwksClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
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
      throw new BadRequestException(
        `You have submitted a token with an invalid header. Please check and try again.`,
      );

    const key = await this.client.getSigningKey(decodedHeader.header.kid);

    const publicKey = key.getPublicKey();

    return this.jwtService.verifyAsync(token, {
      secret: publicKey,
      algorithms: ['RS256'],
    });
  }
}
