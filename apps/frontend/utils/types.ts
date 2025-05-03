import { AuthMethod } from "@/utils/constants";

export type DeviceDetails = {
  device_name: string;
  user_agent: string;
  ip_address: string;
  location: string;
};

export type SignUpDto = {
  email: string;
  password: string;
  phone_number: string;
  gender: string;
  dob: string;
  address: string;
  first_name: string;
  last_name: string;
  finger_print: string;
  deviceDetailsDto: DeviceDetails;
};

export type SignInDto = {
  email: string;
  password: string;
  fingerprint: string;
};

export type SimpleDate = {
  year: number;
  month: number;
  day: number;
};

export type VerifyEmailDto = {
  email: string;
  otp: string;
};

export type ForgotPasswordDto = {
  email: string;
};

export type ResetPasswordDto = {
  newPassword: string;
  authorizationCode: string;
};

export type OAuthCallbackDto = {
  first_name: string;
  last_name: string;
  access_token: string;
  refresh_token: string;
  phone_number: string;
  dob: string;
  gender: string;
  address: string;
  finger_print: string;
  deviceDetailsDto: DeviceDetails;
};

export type GetInfoOAuthCallbackDto = {
  iss: string;
  code: string;
  authMethod: AuthMethod;
};

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type OAuthNames = {
  first_name: string;
  last_name: string;
};

export type GenerateToken = {
  payload: string;
};

export type VerifyToken = {
  token: string;
};

export type SocialType = "instagram" | "github" | "x";

export interface SocialItem {
  key: number | string;
  type: SocialType;
  username: string;
  url: string;
}

export type FriendType = {
  avatar: string;
  name: string;
  id: string;
};

export interface Post {
  id: number;
  author: string;
  content: string;
  time: string;
  avatar: string;
  image?: string;
  isShared?: boolean;
  originalPost?: {
    author: string;
    content: string;
    time: string;
    avatar: string;
    image?: string;
  };
}
