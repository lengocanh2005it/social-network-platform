import { UpdatePasswordDto } from '@app/common/dtos/auth';
import {
  CreateFriendRequestDto,
  GetFriendRequestsQueryDto,
  GetFriendsListQueryDto,
  ResponseFriendRequestDto,
} from '@app/common/dtos/friends';
import { GetPostQueryDto } from '@app/common/dtos/posts';
import {
  CreateUserSessionDto,
  GetBlockedUsersListQueryDto,
  GetUserQueryDto,
  SearchUserQueryDto,
  UpdateUserProfileDto,
  UpdateUserSessionDto,
  UploadUserImageQueryDto,
} from '@app/common/dtos/users';
import { Verify2FaActions } from '@app/common/utils';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @EventPattern('update-password')
  async updatePassword(@Payload() updatePasswordDto: UpdatePasswordDto) {
    return this.usersService.updatePassword(updatePasswordDto);
  }

  @MessagePattern('get-me')
  async getMe(
    @Payload('email') email: string,
    @Payload('getUserQueryDto') getUserQueryDto: GetUserQueryDto,
  ) {
    return this.usersService.handleGetMe(email, getUserQueryDto);
  }

  @MessagePattern('update-profile')
  async updateUserProfile(
    @Payload('updateUserProfileDto') updateUserProfileDto: UpdateUserProfileDto,
    @Payload('email') email: string,
  ) {
    return this.usersService.updateUserProfile(updateUserProfileDto, email);
  }

  @MessagePattern('verify-password')
  async verifyUserPassword(
    @Payload('currentPassword') currentPassword: string,
    @Payload('email') email: string,
  ) {
    return this.usersService.verifyUserPassword(currentPassword, email);
  }

  @EventPattern('create-user-session')
  async createUserSession(
    @Payload() createUserSessionDto: CreateUserSessionDto,
  ) {
    return this.usersService.createUserSession(createUserSessionDto);
  }

  @MessagePattern('get-user-device')
  async getUserDevice(
    @Payload('user_id') userId: string,
    @Payload('finger_print') fingerPrint: string,
  ) {
    return this.usersService.getUserDevice(userId, fingerPrint);
  }

  @MessagePattern('get-user-session')
  async getUserSession(
    @Payload('user_id') userId: string,
    @Payload('finger_print') fingerPrint: string,
  ) {
    return this.usersService.getUserSession(userId, fingerPrint);
  }

  @EventPattern('deactive-other-sessions')
  async deactivateOtherSessions(
    @Payload('user_id') userId: string,
    @Payload('exclude_fingerprint') excludeFingerprint: string,
  ) {
    return this.usersService.deactivateOtherSessions(
      userId,
      excludeFingerprint,
    );
  }

  @EventPattern('update-user-session')
  async updateUserSession(
    @Payload() updateUserSessionDto: UpdateUserSessionDto,
  ) {
    return this.usersService.updateUserSession(updateUserSessionDto);
  }

  @MessagePattern('get-user-by-field')
  async getUserByPhoneNumber(
    @Payload()
    payload: {
      field: 'email' | 'phone_number' | 'id' | 'username';
      value: string;
      getUserQueryDto: GetUserQueryDto;
    },
  ) {
    const { field, value, getUserQueryDto } = payload;

    return this.usersService.handleGetUserByField(
      field,
      value,
      getUserQueryDto,
    );
  }

  @EventPattern('update-status-2fa')
  async updateStatus2Fa(
    @Payload('email') email: string,
    @Payload('action') action: Verify2FaActions,
  ) {
    return this.usersService.updateStatus2Fa(email, action);
  }

  @EventPattern('update-image')
  async updateUserImage(
    @Payload('user_id') user_id: string,
    @Payload('uploadUserImageQueryDto')
    uploadUserImageQueryDto: UploadUserImageQueryDto,
    @Payload('fileUrl') fileUrl: string,
  ) {
    return this.usersService.updateUserImage(
      user_id,
      uploadUserImageQueryDto,
      fileUrl,
    );
  }

  @MessagePattern('get-feed')
  async getMyFeed(
    @Payload('username') username: string,
    @Payload('getPostQueryDto')
    getPostQueryDto: GetPostQueryDto,
    @Payload('email') email: string,
  ) {
    return this.usersService.getMyFeed(username, getPostQueryDto, email);
  }

  @MessagePattern('get-friends')
  async getFriendsOfUser(@Payload('email') email: string) {
    return this.usersService.getFriends(email);
  }

  @MessagePattern('create-friend-request')
  async createFriendRequest(
    @Payload('email') email: string,
    @Payload('createFriendRequestDto')
    createFriendRequestDto: CreateFriendRequestDto,
  ) {
    return this.usersService.createFriendRequest(email, createFriendRequestDto);
  }

  @MessagePattern('response-friend-request')
  async responseFriendRequest(
    @Payload('email') email: string,
    @Payload('responseFriendRequestDto')
    responseFriendRequestDto: ResponseFriendRequestDto,
  ) {
    return this.usersService.responseFriendRequest(
      email,
      responseFriendRequestDto,
    );
  }

  @MessagePattern('get-profile')
  async getProfile(
    @Payload('username') username: string,
    @Payload('email') email: string,
    @Payload('getUserQueryDto') getUserQueryDto: GetUserQueryDto,
  ) {
    return this.usersService.getProfile(username, email, getUserQueryDto);
  }

  @MessagePattern('delete-friend-request')
  async deleteFriendRequest(
    @Payload('email') email: string,
    @Payload('target_id') target_id: string,
  ) {
    return this.usersService.deleteFriendRequest(email, target_id);
  }

  @MessagePattern('get-friend-requests')
  async getFriendRequests(
    @Payload('email') email: string,
    @Payload('getFriendRequestsQueryDto')
    getFriendRequestsQueryDto?: GetFriendRequestsQueryDto,
  ) {
    return this.usersService.getFriendRequests(
      email,
      getFriendRequestsQueryDto,
    );
  }

  @MessagePattern('get-friends-list')
  async getFriendsList(
    @Payload('email') email: string,
    @Payload('getFriendsListQueryDto')
    getFriendsListQueryDto: GetFriendsListQueryDto,
  ) {
    return this.usersService.getFriendsList(email, getFriendsListQueryDto);
  }

  @MessagePattern('block-user')
  async blockUser(
    @Payload('email') email: string,
    @Payload('targetUserId') targetUserId: string,
  ) {
    return this.usersService.blockUser(email, targetUserId);
  }

  @MessagePattern('get-blocked-users')
  async getBlockedUsersList(
    @Payload('email') email: string,
    @Payload('getBlockedUsersListQueryDto')
    getBlockedUsersListQueryDto?: GetBlockedUsersListQueryDto,
  ) {
    return this.usersService.getBlockedUsersList(
      email,
      getBlockedUsersListQueryDto,
    );
  }

  @MessagePattern('unblock-user')
  async unblockUser(
    @Payload('email') email: string,
    @Payload('targetId') targetId: string,
  ) {
    return this.usersService.unblockUser(email, targetId);
  }

  @MessagePattern('get-users')
  async getUsers(
    @Payload('email') email: string,
    @Payload('searchUserQueryDto') searchUserQueryDto: SearchUserQueryDto,
  ) {
    return this.usersService.getUsers(email, searchUserQueryDto);
  }

  @MessagePattern('get-users-by-ids')
  async getUsersByIds(@Payload() userIds: string[]) {
    return this.usersService.getUsersByIds(userIds);
  }

  @MessagePattern('check-friendship-status')
  async handleCheckFriendship(
    @Payload('user_id_1') userId1: string,
    @Payload('user_id_2') userId2: string,
  ) {
    return this.usersService.handleCheckFriendship(userId1, userId2);
  }

  @MessagePattern('get-mututal-friends')
  async getMututalFriends(
    @Payload('currentUserId') currentUserId: string,
    @Payload('targetId') targetId: string,
  ) {
    return this.usersService.getMutualFriendsCount(currentUserId, targetId);
  }

  @MessagePattern('get-users-by-full-name')
  async getUsersByFullName(@Payload('full_name') full_name: string) {
    return this.usersService.getUsersByFullName(full_name);
  }
}
