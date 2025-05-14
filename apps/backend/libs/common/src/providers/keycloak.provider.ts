import { KeycloakSignUpData } from '@app/common/utils';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as jwksClient from 'jwks-rsa';
import { omit } from 'lodash';
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
        statusCode: HttpStatus.UNAUTHORIZED,
        message: `Token verification failed. Please check and try again.`,
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
    const payload: any = await this.verifyToken(access_token);

    return payload?.resource_access?.[this.clientId]?.roles[0] || null;
  };

  public revokeToken = async (
    token: string,
    tokenTypeHint: 'refresh_token' | 'access_token',
  ): Promise<void> => {
    const revokeUrl = `${this.keyCloakUrl}/realms/${this.keyCloakRealm}/protocol/openid-connect/revoke`;

    const payload = new URLSearchParams();

    payload.append('client_id', this.clientId);
    payload.append('client_secret', this.clientSecret);
    payload.append('token', token);
    payload.append('token_type_hint', tokenTypeHint);

    try {
      await firstValueFrom(
        this.httpService.post(revokeUrl, payload, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to revoke token.',
      });
    }
  };

  private getAdminToken = async (): Promise<string> => {
    try {
      const baseUrl = `${this.keyCloakUrl}/realms/${this.keyCloakRealm}/protocol/openid-connect/token`;

      const data = new URLSearchParams();

      data.append('grant_type', 'client_credentials');

      data.append('client_id', this.clientId);

      data.append('client_secret', this.clientSecret);

      const response = await firstValueFrom(
        this.httpService.post(baseUrl, data),
      );

      return response.data.access_token;
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.response?.data || error?.message,
      });
    }
  };

  public getUserByEmailKeycloak = async (email: string): Promise<any> => {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.keyCloakUrl}/admin/realms/${this.keyCloakRealm}/users?email=${encodeURIComponent(email)}`,
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
            },
          },
        ),
      );

      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
  };

  public updatePasswordUserKeyCloak = async (
    newPassword: string,
    email: string,
  ) => {
    const user = await this.getUserByEmailKeycloak(email);

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    try {
      await firstValueFrom(
        this.httpService.put(
          `${this.keyCloakUrl}/admin/realms/${this.keyCloakRealm}/users/${user.id}/reset-password`,
          {
            type: 'password',
            temporary: false,
            value: newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
  };

  public signUpByKeycloak = async (keycloakSignUpData: KeycloakSignUpData) => {
    try {
      const { email, password } = keycloakSignUpData;

      const baseUrl = `${this.keyCloakUrl}/admin/realms/${this.keyCloakRealm}/users`;

      const data = {
        ...omit(keycloakSignUpData, ['password']),
        enabled: true,
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: false,
          },
        ],
      };

      const response = await firstValueFrom(
        this.httpService.post(baseUrl, data, {
          headers: {
            Authorization: `Bearer ${await this.getAdminToken()}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      if (response.status !== 201)
        throw new RpcException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Have an error when creating user`,
        });

      const users = await firstValueFrom(
        this.httpService.get(`${baseUrl}?username=${email}`, {
          headers: {
            Authorization: `Bearer ${await this.getAdminToken()}`,
          },
        }),
      );

      const userId = users.data[0]?.id;

      if (!userId)
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found.',
        });

      await this.assignRoleKeycloak('user', userId);
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.response?.data || error?.message,
      });
    }
  };

  public assignRoleKeycloak = async (
    roleName: 'admin' | 'user',
    userId: string,
  ) => {
    const clientId = await this.getClientId(this.clientId);

    const roles = await this.getClientRoles(clientId);

    const userRole = roles.find((role) => role.name === roleName);

    if (!userRole)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Role ${roleName} not found.`,
      });

    await firstValueFrom(
      this.httpService.post(
        `${this.keyCloakUrl}/admin/realms/${this.keyCloakRealm}/users/${userId}/role-mappings/clients/${clientId}`,
        [userRole],
        {
          headers: {
            Authorization: `Bearer ${await this.getAdminToken()}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
  };

  private getClientId = async (clientName: string): Promise<string> => {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.keyCloakUrl}/admin/realms/${this.keyCloakRealm}/clients`,
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
            },
          },
        ),
      );

      const client = response.data.find((c: any) => c.clientId === clientName);

      return client ? client.id : '';
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.response?.data || error?.message,
      });
    }
  };

  private getClientRoles = async (clientId: string): Promise<any[]> => {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.keyCloakUrl}/admin/realms/${this.keyCloakRealm}/clients/${clientId}/roles`,
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
  };

  public verifyUserEmailKeycloak = async (userId: string): Promise<void> => {
    const baseUrl = `${this.keyCloakUrl}/admin/realms/${this.keyCloakRealm}/users/${userId}`;

    try {
      await firstValueFrom(
        this.httpService.put(
          baseUrl,
          {
            emailVerified: true,
          },
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
  };

  public logOutUserSessions = async (email: string) => {
    try {
      const user = await this.getUserByEmailKeycloak(email);

      await firstValueFrom(
        this.httpService.post(
          `${this.keyCloakUrl}/admin/realms/${this.keyCloakRealm}/users/${user.id}/logout`,
          null,
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
            },
          },
        ),
      );
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
  };

  public signInByKeycloak = async (email: string, password: string) => {
    try {
      const keycloakUrl = `${this.keyCloakUrl}/realms/${this.keyCloakRealm}/protocol/openid-connect/token`;

      const data = new URLSearchParams();

      data.append('grant_type', 'password');

      data.append('client_id', this.clientId);

      data.append('client_secret', this.clientSecret);

      data.append('username', email);

      data.append('password', password);

      const response = await firstValueFrom(
        this.httpService.post(keycloakUrl, data),
      );

      return response.data;
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.response?.data || error?.message,
      });
    }
  };
}
