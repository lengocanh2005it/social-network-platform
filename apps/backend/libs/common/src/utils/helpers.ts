import {
  ACCESS_TOKEN_LIFE,
  IS_PRODUCTION,
  REFRESH_TOKEN_LIFE,
  SignInResponse,
} from '@app/common/utils/constants';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as bcryptjs from 'bcryptjs';
import { config } from 'dotenv';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';

config();

const configService = new ConfigService();

const httpService = new HttpService();

export function generateKafkaServiceMap(
  services: readonly {
    serviceName: string;
    clientId: string;
    groupId: string;
  }[],
): Record<string, { clientId: string; groupId: string }> {
  return services.reduce(
    (acc, curr) => {
      acc[curr.serviceName] = {
        clientId: curr.clientId,
        groupId: curr.groupId,
      };
      return acc;
    },
    {} as Record<string, { clientId: string; groupId: string }>,
  );
}

export const isValidPassword = (
  inputPassword: string,
  userPassword: string,
) => {
  return bcryptjs.compareSync(inputPassword, userPassword);
};

export const hashPassword = (password: string) => {
  return bcryptjs.hashSync(password, bcryptjs.genSaltSync());
};

export const generateOtp = (length = 6): string => {
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
};

export const verifyTokenWithKeycloak = async (
  token: string,
): Promise<boolean> => {
  try {
    const keyCloakUrl = configService.get<string>(
      'KEYCLOAK_AUTH_SERVER_URL',
      '',
    );

    const keyCloakRealm = configService.get<string>('KEYCLOAK_REALM', '');

    const keyCloakClientId = configService.get<string>(
      'KEYCLOAK_CLIENT_ID',
      '',
    );

    const keyCloakClientSecret = configService.get<string>(
      'KEYCLOAK_SECRET',
      '',
    );

    const payload = new URLSearchParams();

    payload.append('token', token);

    payload.append('client_id', keyCloakClientId);

    payload.append('client_secret', keyCloakClientSecret);

    const response = await firstValueFrom(
      httpService.post(
        `${keyCloakUrl}/realms/${keyCloakRealm}/protocol/openid-connect/token/introspect`,
        payload.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    return response.data.active;
  } catch (error) {
    console.error(error);

    return false;
  }
};

export function isValidUUID(uuid: string): boolean {
  const regex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  return regex.test(uuid);
}

export const initializeCookies = (
  res: Response,
  signInResponse: SignInResponse,
) => {
  const { access_token, refresh_token, role } = signInResponse;

  res.cookie('access_token', access_token, {
    httpOnly: true,
    secure: IS_PRODUCTION ? true : false,
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_LIFE,
  });

  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: IS_PRODUCTION ? true : false,
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_LIFE,
  });

  res.cookie('role', role, {
    httpOnly: false,
    secure: IS_PRODUCTION ? true : false,
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_LIFE,
  });

  res.cookie('logged_in', true, {
    httpOnly: false,
    secure: IS_PRODUCTION ? true : false,
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_LIFE,
  });
};

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toPascalCase(s: string) {
  return s
    .split(/_|-/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
