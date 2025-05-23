import { AuthMethod } from "@/utils/constants";
import { ZonedDateTime } from "@internationalized/date";
import {
  GenderType,
  PostContentType,
  PostPrivaciesType,
  UserEducationsType,
  UserWorkPlacesType,
} from "@repo/db";

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
  captchaToken: string;
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

export enum VerifyEmailActionEnum {
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
  OTHER = "other",
}

export type VerifyEmailDto = {
  email: string;
  otp: string;
  action: VerifyEmailActionEnum;
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

export type SocialType = "instagram" | "github" | "twitter";

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

// export interface Post {
//   id: number;
//   author: string;
//   content: string;
//   time: string;
//   avatar: string;
//   image?: string;
//   isShared?: boolean;
//   originalPost?: {
//     author: string;
//     content: string;
//     time: string;
//     avatar: string;
//     image?: string;
//   };
// }

export type GetUserQueryDto = {
  includeProfile?: boolean;
  includeFollowings?: boolean;
  includeGroups?: boolean;
  includeWorkPlaces?: boolean;
  includeTargets?: boolean;
  includeEducations?: boolean;
  includeSocials?: boolean;
  includePosts?: boolean;
};

export type Education = {
  id: string;
  major: string;
  degree: string;
  school_name: string;
  start_date: string;
  end_date: string;
};

export type WorkPlace = {
  id: string;
  position: string;
  company_name: string;
  start_date: string;
  end_date: string;
};

export type InfoDetailsType = {
  dob: string;
  phone_number: string;
  gender: GenderType;
  address: string;
  bio?: string;
  first_name: string;
  last_name: string;
  nickname?: string;
};

export type SocialsLinkType = {
  github_link?: string;
  twitter_link?: string;
  instagram_link?: string;
};

export type UpdateUserProfile = {
  infoDetails?: InfoDetailsType;
  workPlaces?: UserWorkPlacesType[];
  socials?: SocialsLinkType;
  educations?: UserEducationsType[];
};

export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
};

export type VerifyOwnershipOtpType = {
  method: "email" | "sms";
  otp: string;
  email?: string;
  phone_number?: string;
};

export type SendOtpType = {
  method: "email" | "sms";
  email?: string;
  phone_number?: string;
  type: "update" | "verify";
};

export type TempUserUpdateType = {
  first_name: string;
  last_name: string;
  nick_name?: string;
  phone_number: string;
  gender: GenderType;
  dob: ZonedDateTime;
  address: string;
};

export enum Verify2FaActionEnum {
  DISABLE_2FA = "disable-2fa",
  ENABLE_2FA = "enable-2fa",
  SIGN_IN = "sign-in",
  OTHER = "other",
}

export type Verify2FaType = {
  otp: string;
  action: Verify2FaActionEnum;
  password?: string;
  token?: string;
  email: string;
};

export enum UploadUserImageTypeEnum {
  AVATAR = "avatar",
  COVER_PHOTO = "cover_photo",
}

export type UploadUserImageType = {
  type: UploadUserImageTypeEnum;
  file: File;
};

export type GetFeedQueryDto = {
  limit?: number;
  after?: string;
};

export type CreatePostImageDto = {
  image_url: string;
};

export type CreatePostContentDto = {
  content: string;
  type: PostContentType;
};

export type CreatePostVideoDto = {
  video_url: string;
};

export type DeleteMediaDto = {
  url: string;
  type: "image" | "video";
};

export type CreatePostDto = {
  privacy: PostPrivaciesType;
  group_id?: string;
  hashtags?: string[];
  tags?: string[];
  images?: CreatePostImageDto[];
  contents?: CreatePostContentDto[];
  videos?: CreatePostVideoDto[];
};

export type UpdatePostDto = {
  privacy: PostPrivaciesType;
  hashtags?: string[];
  tags?: string[];
  images?: CreatePostImageDto[];
  contents?: CreatePostContentDto[];
  videos?: CreatePostVideoDto[];
  deletedMediaDto?: DeleteMediaDto[];
};

export type UpdatePostType = {
  postId: string;
  updatePostDto: UpdatePostDto;
};

export interface Post {
  id: string;
  user: {
    id: string;
    email: string;
    profile: {
      avatar_url: string;
      first_name: string;
      last_name: string;
    };
  };
  privacy: PostPrivaciesType;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  images: {
    id: string;
    image_url: string;
    total_likes: number;
    total_shares: number;
    total_comments: number;
  }[];
  videos: {
    id: string;
    video_url: string;
    total_likes: number;
    total_shares: number;
    total_comments: number;
  }[];
  tags: any[];
  contents: {
    id: string;
    content: string;
    type: PostContentType;
  }[];
  hashtags: {
    id: string;
    hashtag: string;
  }[];
}

export type MediaUploadResponseType = {
  media: {
    type: string;
    message: string;
    fileUrl: string;
    fileName: string;
    fileSize: string;
  }[];
};
