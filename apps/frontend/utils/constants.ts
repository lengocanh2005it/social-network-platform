export const genders = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
  { key: "other", label: "Other" },
];

export enum AuthMethod {
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
}

export enum Provider {
  FACEBOOK = "facebook",
  GOOGLE = "google",
}

export enum CreateCommentTargetType {
  POST = "post",
  VIDEO = "video",
  IMAGE = "image",
}

export enum ResponseFriendRequestAction {
  ACCEPT = "accept",
  REJECT = "reject",
}

export enum SocketNamespace {
  PRESENCE = "presence",
  CONVERSATIONS = "conversations",
  NOTIFICATIONS = "notifications",
}

export enum FriendListType {
  FRIENDS = "friends",
  REQUESTS = "requests",
  SUGGESTIONS = "suggestions",
}

export const OTP_RESEND_INTERVAL = 120;
export const HIDE_DURATION = 5000;
export const MAX_DISPLAY_FRIEND_LISTS = 9;
export const MAX_VISIBLE_CHATBOX = 3;
