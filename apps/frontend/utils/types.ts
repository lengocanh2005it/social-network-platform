import { FullUserType, PostDetails } from "@/store";
import {
  AuthMethod,
  colorMap,
  CreateCommentTargetType,
  FriendListType,
  ResponseFriendRequestAction,
} from "@/utils/constants";
import { DateValue, ZonedDateTime } from "@internationalized/date";
import {
  ContentStoryType,
  FriendShipStatusType,
  GenderType,
  NotificationType,
  PhotoTypeEnum,
  PostContentType,
  PostPrivaciesEnum,
  PostPrivaciesType,
  ReportReasonEnum,
  ReportStatusEnum,
  ReportsType,
  ReportTypeEnum,
  StoryStatusEnum,
  ThemeEnum,
  UserEducationsType,
  UserProfilesType,
  UsersType,
  UserWorkPlacesType,
} from "@repo/db";
import { StringNullableChain } from "lodash";

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
  username: string;
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
  VERIFY_DEVICE = "verify-device",
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

export type GetUserQueryDto = {
  includeProfile?: boolean;
  includeFollowings?: boolean;
  includeWorkPlaces?: boolean;
  includeTargets?: boolean;
  includeEducations?: boolean;
  includeSocials?: boolean;
  includePosts?: boolean;
  username: string;
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
  username: string;
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
  username: string;
};

export enum Verify2FaActionEnum {
  DISABLE_2FA = "disable-2fa",
  ENABLE_2FA = "enable-2fa",
  SIGN_IN = "sign-in",
  VERIFY_DEVICE = "verify-device",
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
      username: string;
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

export type TopLikedUserType = {
  id: string;
  full_name: string;
};

export type LikedUserType = {
  id: string;
  email: string;
  avatar_url: string;
  full_name: string;
  liked_at: string;
};

export type CreateCommentDto = {
  media_id?: string;
  targetType: CreateCommentTargetType;
  parent_comment_id?: string;
  contents: CreatePostContentDto[];
  post_id: string;
};

export type CreateCommentReplyDto = {
  contents: CreatePostContentDto[];
  parent_comment_id: string;
  post_id: string;
};

export type CreateTrustDeviceDto = DeviceDetails & {
  email: string;
};

export type GroupedComment = {
  id: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  content: string;
  created_at: string;
  total_replies: number;
  total_likes: number;
  likedByCurrentUser: boolean;
  type: CreateCommentTargetType;
  parent_id?: string | null;
};

export type GetCommentQueryDto = GetFeedQueryDto;

export type GetCommentRepliesQueryDto = GetFeedQueryDto;

export type GetCommentLikeQueryDto = GetFeedQueryDto;

export type DeleteCommentDto = {
  commentId: string;
  postId: string;
};

export type CommentLikedType = {
  id: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  liked_at: string;
};

export type CreatePostShare = {
  privacy: PostPrivaciesType;
  group_id?: string;
  hashtags?: string[];
  contents: CreatePostContentDto[];
  post_id: string;
};

export type MediaDetails = {
  id: string;
  post_id: string;
  image_url?: string;
  video_url?: string;
  total_comments: number;
  total_likes: number;
  total_shares: number;
  likedByCurrentUser: boolean;
};

export type GetCommentMediaQueryDto = GetFeedQueryDto & {
  type: "image" | "video";
};

export type MediaCommentType = {
  id: string;
  content: string;
  created_at: string;
  total_likes: number;
  updated_at: string;
  user: {
    id: string;
    avatar_url: string;
    full_name: string;
  };
};

export type LikeMediaPostDto = {
  type: "video" | "image";
};

export type LikeMediaPostPayload = {
  postId: string;
  mediaId: string;
  likeMediaPostDto: LikeMediaPostDto;
};

export type UnlikeMediaPostPayload = {
  postId: string;
  mediaId: string;
  unlikeMediaPostQueryDto: LikeMediaPostDto;
};

export type RelationshipType = {
  status: "none" | "pending" | "accepted";
  isInitiator: boolean;
  initiatorId?: string;
  targetId?: string;
  initiated_at?: string;
  confirmed_at?: string;
};

export type CreateFriendRequestType = {
  target_id: string;
};

export type ResponseFriendRequestType = {
  action: ResponseFriendRequestAction;
  initiator_id: string;
};

export type GetFriendRequestsQueryDto = {
  after?: string;
  limit?: number;
};

export type GetFriendsListQueryDto = GetFriendRequestsQueryDto & {
  username: string;
  full_name?: string;
  type: FriendListType;
};

export type FriendRequestsType = {
  friendship_status: FriendShipStatusType;
  initiator_id: string;
  initiated_at: string;
  confirmed_at?: string;
  initiator: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
};

export type Friend = {
  user_id: string;
  full_name: string;
  username: string;
  mutual_friends: number;
  avatar_url: string;
  is_friend: boolean;
  is_online?: boolean;
};

export type BlockUserType = {
  targetId: string;
};

export type GetBlockedUsersListQueryDto = GetFriendRequestsQueryDto;

export type BlockedUserType = {
  user_id: string;
  full_name: string;
  avatar_url: string;
  username: string;
  blocked_at: string;
};

export type SearchUserQueryDto = GetFeedQueryDto & {
  full_name: string;
};

export type UserSearchResult = {
  id: string;
  full_name: string;
  avatar_url: string;
  username: string;
};

export type CreateMessageDto = {
  content: string;
  reply_to_message_id?: string;
  target_id: string;
};

export type Conversation = {
  id: string;
  created_at: string;
};

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
    is_online: boolean;
  };
  parent_message?: Message;
  is_read_by_receiver: boolean;
};

export type GetMessagesQueryDto = GetFeedQueryDto;

export type UpdateMessageDto = {
  messageId: string;
  conversationId: string;
  content: string;
};

export type DeleteMessageDto = {
  messageId: string;
  conversationId: string;
};

export type CreateStoryDto = {
  content_type: ContentStoryType;
  content_url?: string;
  text_content?: string;
  expires_at: string;
};

export type GetStoryQueryDto = GetFeedQueryDto;

export type GetStoryViewersQueryDto = GetFeedQueryDto;

export type Story = {
  id: string;
  content_type: ContentStoryType;
  status: StoryStatusEnum;
  content_url: string | null;
  text_content: string | null;
  created_at: string;
  expires_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
  total_views: number;
  viewed_by_current_user: boolean;
};

export type StoryViewer = {
  user_id: string;
  full_name: string;
  viewed_at: string;
  avatar_url: string;
  username: string;
};

export type GetNotificationsQueryDto = GetFeedQueryDto & { is_read: string };

export type DeleteNotificationQueryDto = {
  notificationIds: string[];
};

export type Notification = {
  id: string;
  type: NotificationType;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
  is_read: boolean;
  sender?: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
};

export enum NotificationStatus {
  READ = "read",
  UNREAD = "unread",
}

export interface NotificationGroupState {
  data: Notification[];
  loading: boolean;
  error?: string;
  nextCursor?: string;
}

export type FriendSuggestionType = {
  user_id: string;
  full_name: string;
  avatar_url: string;
  username: string;
  mutual_friends: number;
};

export type GetTaggedUsersQueryDto = GetFeedQueryDto;

export type TaggedUserType = {
  user_id: string;
  full_name: string;
  avatar_url: string;
  username: string;
  mutual_friends: number;
  is_friend: boolean;
};

export type GetConversationsQueryDto = GetFeedQueryDto & {
  full_name?: string;
};

export type ConversationDropdownType = {
  id: string;
  target_user: Friend;
  last_message_at: string;
  last_message: Message;
};

export type GetPhotosOfUserQueryDto = GetFeedQueryDto & {
  username: string;
};

export type Photo = {
  id: string;
  url: string;
  user_id: string;
  type: PhotoTypeEnum;
  metadata?: Record<string, any>;
  privacy: PostPrivaciesEnum;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
};

export type CreateBookMarkDto = {
  postId: string;
};

export type GetBookMarksQueryDto = GetFeedQueryDto;

export type DeleteBookMarksQueryDto = {
  postIds: string[];
};

export type BookMark = {
  id: string;
  saved_at: string;
  user: Omit<UsersType & { profile: UserProfilesType }, "password">;
  post: PostDetails;
};

export type UpdateThemeDto = {
  theme: ThemeEnum;
};

export type Color = keyof typeof colorMap;

export type GetActivitiesQueryDto = GetFeedQueryDto & {
  fullName?: string;
};

export type Activity = {
  id: string;
  action: string;
  user_id: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  user: FullUserType;
};

export type StatsType = {
  title: string;
  value: number;
  percent: string;
  trend: string;
  icon: React.ElementType;
  color: Color;
  sub: string;
};

export type GrowthOverviewType = {
  name: string;
  users: number;
  posts: number;
};

export type GetUsersDashboardQueryDto = GetFeedQueryDto & {
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
};

export type ErrorState = {
  email?: string;
  phoneNumber?: string;
};

export type FilterUserType = {
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  exactMatch: boolean;
};

export type UserDashboardType = UsersType & {
  profile: UserProfilesType;
} & {
  is_online: boolean;
  last_seen_at: string;
};

export type UpdateUserSuspensionDto = {
  is_suspended: boolean;
  reason?: string;
};

export type UpdateUserSuspensionData = {
  userId: string;
  updateUserSuspensionDto: UpdateUserSuspensionDto;
};

export type GetPostsDashboardQueryDto = GetFeedQueryDto & {
  email?: string;
};

export type UpdatePostStatusData = {
  postId: string;
  updatePostStatusDto: {
    is_active: boolean;
    reason?: string;
  };
};

export type GetSharesPostQueryDto = GetFeedQueryDto;

export type GetStoriesDashboardQueryDto = GetFeedQueryDto & {
  email?: string;
  from?: DateValue;
  to?: DateValue;
};

export type UpdateStoryStatusData = {
  storyId: string;
  updateStoryStatusDto: {
    status: StoryStatusEnum;
    reason?: string;
  };
};

export type ReportPostDto = {
  postId: string;
  reason: ReportReasonEnum;
  type: ReportTypeEnum;
};

export type GetReportsQueryDto = GetFeedQueryDto & {
  type?: ReportTypeEnum;
  from?: DateValue;
  to?: DateValue;
};

export type ReportsDashboardDetailsType = ReportsType & {
  reporter: {
    id: string;
    email: string;
    profile: {
      first_name: string;
      last_name: string;
      avatar_url: string;
      username: string;
    };
  };
};

export type ReportsDashboardType = {
  targetId: string;
  type: ReportTypeEnum;
  count: number;
  reports: ReportsDashboardDetailsType[];
  post?: PostDetails;
  story?: Story;
};

export type GetReportersOfReportQueryDto = GetFeedQueryDto & {
  reason?: ReportReasonEnum;
};

export type UpdateReportStatusDto = {
  reportId: string;
  status: ReportStatusEnum;
};
