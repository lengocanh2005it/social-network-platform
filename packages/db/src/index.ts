export { PrismaClient } from "@prisma/client";

export type {
  Gender as GenderType,
  GroupMemberRole as GroupMemberRoleType,
  PostPrivacies as PostPrivaciesType,
  Role as RoleType,
  SessionStatus as SessionStatusType,
  UserDevices as UserDevicesType,
  UserEducations as UserEducationsType,
  UserProfiles as UserProfilesType,
  UserSessions as UserSesstionsType,
  UserSocials as UserSocialsType,
  Users as UsersType,
  UserWorkPlaces as UserWorkPlacesType,
  PostContentType as PostContentType,
  FriendShipStatus as FriendShipStatusType,
  Posts as PostsType,
  Comments as CommentsType,
} from "@prisma/client";

import type { Prisma } from "@prisma/client";

export type { Prisma };

export {
  Gender as GenderEnum,
  GroupMemberRole as GroupMemberRoleEnum,
  OAuthProvider as OAuthProviderEnum,
  PostPrivacies as PostPrivaciesEnum,
  Role as RoleEnum,
  SessionStatus as SessionStatusEnum,
  PostContentType as PostContentTypeEnum,
  FriendShipStatus as FriendShipEnum,
} from "@prisma/client";
