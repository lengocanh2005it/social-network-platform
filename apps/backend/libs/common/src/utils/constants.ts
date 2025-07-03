import { RoleEnum } from '@repo/db';
import { config } from 'dotenv';

config();

export type KeycloakSignUpData = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type JwtResetPasswordPayload = {
  email: string;
};

export type UserGoogleKeycloakData = {
  sub: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
};

export type GetInfoAuthorizationCode = {
  given_name: string;
  family_name: string;
  access_token: string;
  refresh_token: string;
  provider: 'google' | 'facebook';
};

export type TokensReponse = {
  access_token: string;
  refresh_token: string;
  role: RoleEnum;
};

export type SignInResponse = TokensReponse & {
  role: RoleEnum;
};

export const DEFAULT_TTL_OTP_EXPIRED = 600000;
export const DEFAULT_TTL_ONLINE = 600000;
export const EMAILS_QUEUE_NAME = 'emails-queue';
export const SMS_QUEUE_NAME = 'sms-queue';
export const BULLMQ_RETRY_LIMIT = 3;
export const BULLMQ_RETRY_DELAY = 5000;
export const IS_PRODUCTION =
  process.env.NODE_ENV === 'production' ? true : false;
export const ACCESS_TOKEN_LIFE = 2 * 60 * 1000;
export const REFRESH_TOKEN_LIFE = 7 * 24 * 60 * 60 * 1000;
export const DEFAULT_ERROR_MESSAGE =
  'Oops! Something went wrong. Please try again.';
export const KAFKA_RETRY_DEFAULT = 5;
export const KAFKA_RETRY_TIME_INITIAL_DEFAULT = 1000;
export const KAFKA_RETRY_TIME_MAX_DEFAULT = 30000;
export const KAFKA_MAX_FLIGHT_REQUESTS_DEFAULT = 10;
export const KAFKA_METADATA_MAX_AGE = 60000;

export enum EmailTemplateNameEnum {
  EMAIL_OTP_VERIFICATION = 'email-otp-verification',
  EMAIL_RESET_PASSWORD = 'email-reset-password',
  EMAIL_VERIFY_DEVICE = 'email-verify-device',
  EMAIL_IDENTITY_VERIFICATION = 'email-identity-verification',
}

export const SUBJECT_EMAIL_MAP = {
  'email-otp-verification': 'Verify Your Email Address',
  'email-reset-password': 'Reset Your Password',
  'email-verify-device': 'Verify New Device',
  'email-identity-verification': 'Verify Account Ownership',
};

export const KAFKA_SERVICES = [
  { serviceName: 'USERS_SERVICE', clientId: 'users', groupId: 'users-group' },
  {
    serviceName: 'AUTH_SERVICE',
    clientId: 'auth',
    groupId: 'auth-group',
  },
  {
    serviceName: 'EMAILS_SERVICE',
    clientId: 'emails',
    groupId: 'emails-group',
  },
  {
    serviceName: 'REDIS_SERVICE',
    clientId: 'redis',
    groupId: 'redis-group',
  },
  {
    serviceName: 'SMS_SERVICE',
    clientId: 'sms',
    groupId: 'sms-group',
  },
  {
    serviceName: 'POSTS_SERVICE',
    clientId: 'posts',
    groupId: 'posts-group',
  },
  {
    serviceName: 'CONVERSATIONS_SERVICE',
    clientId: 'conversations',
    groupId: 'conversations-group',
  },
  {
    serviceName: 'STORIES_SERVICE',
    clientId: 'stories',
    groupId: 'stories-group',
  },
  {
    serviceName: 'NOTIFICATIONS_SERVICE',
    clientId: 'notifications',
    groupId: 'notifications-group',
  },
] as const;

export enum AuthMethod {
  SIGN_IN = 'sign-in',
  SIGN_UP = 'sign-up',
}

export type Dateable = string | Date | null | undefined;

export type SyncOptions<T> = {
  idKey: keyof T;
  compareFields: (a: T, b: T) => boolean;
  isTempId: (id: any) => boolean;
  onCreate: (item: T) => Promise<any>;
  onUpdate: (item: T) => Promise<any>;
  onDelete: (item: T) => Promise<any>;
};

export const publicPaths = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/token/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-otp',
  '/auth/oauth/callback',
  '/auth/oauth/callback/get-info',
  '/auth/generate-token',
  '/auth/verify-token',
  '/auth/token/refresh',
  '/auth/2fa/verify',
  '/auth/trust-device',
  '/socket.io',
  '/',
  '/metrics',
];

export enum VerifyOwnershipOtpMethodEnum {
  EMAIL = 'email',
  SMS = 'sms',
}

export type SmsContentType = {
  from: string;
  to: string;
  message: string;
};

export enum Verify2FaActions {
  ENABLE_2FA = 'enable-2fa',
  DISABLE_2FA = 'disable-2fa',
  SIGN_IN = 'sign-in',
  VERIFY_DEVICE = 'verify-device',
  OTHER = 'other',
}

export enum VerifyOtpActions {
  SIGN_IN = 'sign-in',
  SIGN_UP = 'sign-up',
  VERIFY_DEVICE = 'verify-device',
  OTHER = 'other',
}

export enum UploadUserImageTypeEnum {
  AVATAR = 'avatar',
  COVER_PHOTO = 'cover_photo',
}

export type TwoFaToken = {
  sub: string;
  type: string;
};

export enum CreateCommentTargetType {
  POST = 'post',
  VIDEO = 'video',
  IMAGE = 'image',
}

export type CreateCommentForPost = {
  post_id?: string;
  post_video_id?: string;
  post_image_id?: string;
  parent_comment_id?: string;
  content: string;
  user_id: string;
};

export type CreateCommentMedia = {
  type: 'video' | 'image';
  url: string;
  post_id: string;
};

export enum PostMediaEnum {
  VIDEO = 'video',
  IMAGE = 'image',
}

export enum ResponseFriendRequestAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

export type Message = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  conversation_id: string;
  reply_to_message_id?: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
  parent_message?: Message;
};

export type NotificationParams = {
  senderName?: string;
  postTitle?: string;
  commentContent?: string;
};

export const fieldDisplayMap: Record<string, string> = {
  id: 'ID',
  email: 'email',
  phone_number: 'phone number',
  username: 'username',
  national_id: 'national ID',
  nickname: 'nickname',
};

export enum FriendListType {
  FRIENDS = 'friends',
  REQUESTS = 'requests',
  SUGGESTIONS = 'suggestions',
}
