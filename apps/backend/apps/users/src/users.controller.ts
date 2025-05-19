import { UpdatePasswordDto } from '@app/common/dtos/auth';
import {
  CreateUserSessionDto,
  GetUserQueryDto,
  UpdateUserProfileDto,
  UpdateUserSessionDto,
  UploadUserImageQueryDto,
} from '@app/common/dtos/users';
import { Verify2FaActions } from '@app/common/utils';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { GetPostQueryDto } from '@app/common/dtos/posts';

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
    @Payload('getUserQueryDto') getUserQueryDto?: GetUserQueryDto,
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
      field: 'email' | 'phone_number' | 'id';
      value: string;
      getUserQueryDto?: GetUserQueryDto;
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

  @MessagePattern('get-my-feed')
  async getMyFeed(
    @Payload('email') email: string,
    @Payload('getPostQueryDto')
    getPostQueryDto: GetPostQueryDto,
  ) {
    return this.usersService.getMyFeed(email, getPostQueryDto);
  }

  @MessagePattern('get-friends')
  async getFriendsOfUser(@Payload('user_id') user_id: string) {
    return this.usersService.getFriends(user_id);
  }
}
