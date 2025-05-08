export { PrismaClient } from "@prisma/client";

export type {
  UserProfiles as UserProfilesType,
  Role as RoleType,
  Gender as GenderType,
  GroupMemberRole as GroupMemberRoleType,
  Users as UsersType,
  UserEducations as UserEducationsType,
  UserSocials as UserSocialsType,
  UserWorkPlaces as UserWorkPlacesType,
} from "@prisma/client";

export {
  Role as RoleEnum,
  OAuthProvider as OAuthProviderEnum,
  Gender as GenderEnum,
  GroupMemberRole as GroupMemberRoleEnum,
} from "@prisma/client";
