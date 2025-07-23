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

export const colorMap = {
  blue: {
    border: "hover:border-blue-500",
    text: "text-blue-400",
    bg: "bg-blue-900/50",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    border: "hover:border-purple-500",
    text: "text-purple-400",
    bg: "bg-purple-900/50",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  green: {
    border: "hover:border-green-500",
    text: "text-green-400",
    bg: "bg-green-900/50",
    iconBg: "bg-green-100 dark:bg-green-900/50",
    iconColor: "text-green-600 dark:text-green-400",
  },
  red: {
    border: "hover:border-red-500",
    text: "text-red-400",
    bg: "bg-red-900/50",
    iconBg: "bg-red-100 dark:bg-red-900/50",
    iconColor: "text-red-600 dark:text-red-400",
  },
};
