import {
  ACCESS_TOKEN_LIFE,
  IS_PRODUCTION,
  NotificationParams,
  REFRESH_TOKEN_LIFE,
  SignInResponse,
} from '@app/common/utils/constants';
import { HttpService } from '@nestjs/axios';
import { RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationType } from '@repo/db';
import * as bcryptjs from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import { config } from 'dotenv';
import { Response } from 'express';
import {
  catchError,
  firstValueFrom,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';

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

export function verifyPassword(plainPassword: string, hashedPassword: string) {
  return bcryptjs.compareSync(plainPassword, hashedPassword);
}

export const clearCookies = (res: Response) => {
  const cookieOptions = {
    sameSite: 'lax' as const,
    secure: IS_PRODUCTION,
  };

  res.clearCookie('access_token', {
    ...cookieOptions,
    httpOnly: true,
  });

  res.clearCookie('refresh_token', {
    ...cookieOptions,
    httpOnly: true,
  });

  res.clearCookie('role', {
    ...cookieOptions,
    httpOnly: false,
  });

  res.clearCookie('logged_in', {
    ...cookieOptions,
    httpOnly: false,
  });
};

export function generateKafkaIds(baseClientId: string, baseGroupId: string) {
  const suffix = Math.random().toString(36).substring(2, 8);
  return {
    clientId: `${baseClientId}-${suffix}`,
    groupId: `${baseGroupId}-${suffix}`,
  };
}

export const generateSmsOTPMessage = (
  fullName: string,
  otp: string,
  type: 'update' | 'verify',
): string => {
  const actionMessage =
    type === 'update'
      ? 'to confirm your new phone number.'
      : 'to verify your identity before enabling two-factor authentication.';

  return `Hi ${fullName}, your verification code is ${otp}. Please enter it ${actionMessage}`;
};

export function formatPhoneNumberToE164(phoneNumber: string): string {
  if (phoneNumber.startsWith('0')) {
    return '+84' + phoneNumber.slice(1);
  }

  return phoneNumber;
}

export function formatFileSize(sizeInBytes: number): string {
  const KB = 1024;

  const MB = KB * 1024;

  if (sizeInBytes >= MB) {
    return `${(sizeInBytes / MB).toFixed(2)} MB`;
  } else if (sizeInBytes >= KB) {
    return `${(sizeInBytes / KB).toFixed(2)} KB`;
  } else {
    return `${sizeInBytes} bytes`;
  }
}

export const encodeCursor = (curror: any) => {
  return Buffer.from(JSON.stringify(curror)).toString('base64');
};

export const decodeCursor = (encoded: string) => {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
};

export function isToxic(
  predictions: { label: string; score: number }[][],
): boolean {
  const scores = predictions[0];

  const toxicLabel = scores.find((s) => s.label === 'toxic');

  if (!toxicLabel) return false;

  return toxicLabel.score > 0.7;
}

export const generateNotificationMessage = (
  type: NotificationType,
  params: NotificationParams = {},
): string => {
  switch (type) {
    case 'friend_request':
      return `${params.senderName} sent you a friend request.`;
    case 'friend_request_accepted':
      return `${params.senderName} accepted your friend request.`;
    case 'friend_request_rejected':
      return `${params.senderName} rejected your friend request.`;
    case 'post_liked':
      return params?.postTitle
        ? `${params.senderName} liked your post: "${params.postTitle}".`
        : `${params.senderName} liked your post.`;
    case 'post_commented':
      return `${params.senderName} commented on your post: "${params.commentContent}".`;
    case 'comment_liked':
      return `${params.senderName} liked your comment.`;
    case 'comment_replied':
      return `${params.senderName} replied to your comment: "${params.commentContent}".`;
    case 'post_shared':
      return `${params.senderName} shared your post.`;
    case 'tagged_in_post':
      return `${params.senderName} tagged you in a post.`;
    case 'story_added_by_friend':
      return `${params.senderName} added a new story.`;
    case 'system_announcement':
      return `There is a new system announcement.`;
    default:
      return `You have a new notification.`;
  }
};

export const truncateWithEllipsis = (text: string, maxLength = 100) =>
  text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

export async function sendWithTimeout<T = any>(
  client: ClientProxy,
  pattern: string,
  payload: any,
  ms = 20000,
): Promise<T> {
  return firstValueFrom(
    client.send<T>(pattern, payload).pipe(
      timeout(ms),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          throw new RequestTimeoutException(`Timeout for pattern "${pattern}"`);
        }
        return throwError(() => err);
      }),
    ),
  );
}

export function toPlain<T>(dto: T): Record<string, any> {
  return instanceToPlain(dto);
}

export const appLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp as string}] ${level.toUpperCase()}: ${message as string}`;
    }),
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      dirname: 'logs',
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '14d',
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }),
    new transports.Console(),
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }),
    new transports.Console(),
  ],
});
