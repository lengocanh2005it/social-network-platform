import { UpdatePasswordDto } from '@app/common/dtos/auth';
import {
  CreateFriendRequestDto,
  GetFriendRequestsQueryDto,
  GetFriendsListQueryDto,
  ResponseFriendRequestDto,
} from '@app/common/dtos/friends';
import { CreateNotificationDto } from '@app/common/dtos/notifications';
import { GetPostQueryDto } from '@app/common/dtos/posts';
import {
  CreatePhotoOfUserDto,
  CreateUserSessionDto,
  GetBlockedUsersListQueryDto,
  GetPhotosOfUserQueryDto,
  GetUserQueryDto,
  SearchUserQueryDto,
  UpdateEducationsDto,
  UpdateInfoDetailsDto,
  UpdateSocialsLinkDto,
  UpdateUserProfileDto,
  UpdateUserSessionDto,
  UpdateWorkPlaceDto,
  UploadUserImageQueryDto,
} from '@app/common/dtos/users';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import {
  decodeCursor,
  encodeCursor,
  fieldDisplayMap,
  FriendListType,
  generateNotificationMessage,
  hashPassword,
  REFRESH_TOKEN_LIFE,
  ResponseFriendRequestAction,
  sendWithTimeout,
  SyncOptions,
  toPascalCase,
  UploadUserImageTypeEnum,
  Verify2FaActions,
  verifyPassword,
} from '@app/common/utils';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import {
  FriendShipEnum,
  NotificationTypeEnum,
  PhotoTypeEnum,
  PostPrivaciesEnum,
  SessionStatusEnum,
} from '@repo/db';
import { omit } from 'lodash';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('POSTS_SERVICE') private readonly postsClient: ClientKafka,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientKafka,
  ) {}

  onModuleInit() {
    const postPatterns = ['get-profile-posts'];

    postPatterns.forEach((pattern) =>
      this.postsClient.subscribeToResponseOf(pattern),
    );
  }

  public updatePassword = async (updatePasswordDto: UpdatePasswordDto) => {
    const { password, email } = updatePasswordDto;

    const existingEmail = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });

    if (!existingEmail)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    await this.prismaService.users.update({
      where: {
        email,
      },
      data: {
        password: hashPassword(password),
      },
    });
  };

  public handleGetMe = async (
    email: string,
    getUserQueryDto: GetUserQueryDto,
  ) => {
    const { username } = getUserQueryDto;

    const findUserWithUsername =
      await this.prismaService.userProfiles.findUnique({
        where: {
          username,
        },
        include: {
          user: true,
        },
      });

    if (!findUserWithUsername || !findUserWithUsername.user.email)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The user you're looking for doesn't exist.`,
      });

    const currentUser = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        blockedBy: true,
        blockedUsers: true,
      },
    });

    if (!currentUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const relations = [
      'profile',
      'followings',
      'groups',
      'targets',
      'educations',
      'work_places',
      'socials',
      'posts',
    ];

    const include = relations.reduce((acc, relation) => {
      const fieldName = `include${toPascalCase(relation)}`;
      if (getUserQueryDto?.[fieldName]) {
        acc[relation] = true;
      }
      return acc;
    }, {});

    const findUser = await this.prismaService.users.findUnique({
      where: { email: findUserWithUsername.user.email },
      include: {
        ...include,
        targets: true,
        initiators: true,
      },
    });

    if (!findUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const blockedUserIds = Array.from(
      new Set([
        ...currentUser.blockedUsers.map((u) => u.blocked_user_id),
        ...currentUser.blockedBy.map((u) => u.user_id),
      ]),
    );

    const acceptedTargets = findUser.targets.filter(
      (t) =>
        t.friendship_status === FriendShipEnum.accepted &&
        !blockedUserIds.includes(t.initiator_id),
    );

    const acceptedInitiators = findUser.initiators.filter(
      (i) =>
        i.friendship_status === FriendShipEnum.accepted &&
        !blockedUserIds.includes(i.target_id),
    );

    const total_friends = acceptedTargets.length + acceptedInitiators.length;

    return omit(
      {
        ...findUser,
        total_friends,
      },
      ['password', 'targets', 'initiators'],
    );
  };

  public updateUserProfile = async (
    updateUserProfileDto: UpdateUserProfileDto,
    email: string,
  ) => {
    const existingUserEmail = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
      },
    });

    if (!existingUserEmail)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    if (!updateUserProfileDto || !Object.values(updateUserProfileDto).length)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Please provide data to update user profile.`,
      });

    if (!existingUserEmail.profile) return null;

    const { socials, educations, infoDetails, workPlaces } =
      updateUserProfileDto;

    if (socials) await this.updateSocials(socials, existingUserEmail.id);

    if (educations)
      await this.updateEducations(educations, existingUserEmail.id);

    if (workPlaces)
      await this.updateWorkPlaces(workPlaces, existingUserEmail.id);

    if (infoDetails)
      await this.updateInfoDetails(infoDetails, existingUserEmail.id);

    return this.handleGetMe(email, {
      includeProfile: true,
      includeEducations: true,
      includeWorkPlaces: true,
      includeSocials: true,
      username: existingUserEmail.profile.username,
    });
  };

  private updateSocials = async (
    updateSocialsLinkDto: UpdateSocialsLinkDto,
    user_id: string,
  ) => {
    const existingSocialsLink = await this.prismaService.userSocials.findMany({
      where: { user_id },
    });

    const existingByName = Object.fromEntries(
      existingSocialsLink.map((sl) => [sl.social_name, sl]),
    );

    const { github_link, twitter_link, instagram_link } = updateSocialsLinkDto;

    if (github_link) {
      await this.updateSocialsLink(github_link, 'github', user_id);
    } else if (existingByName['github']) {
      await this.prismaService.userSocials.delete({
        where: { id: existingByName['github'].id },
      });
    }

    if (twitter_link) {
      await this.updateSocialsLink(twitter_link, 'twitter', user_id);
    } else if (existingByName['twitter']) {
      await this.prismaService.userSocials.delete({
        where: { id: existingByName['twitter'].id },
      });
    }

    if (instagram_link) {
      await this.updateSocialsLink(instagram_link, 'instagram', user_id);
    } else if (existingByName['instagram']) {
      await this.prismaService.userSocials.delete({
        where: { id: existingByName['instagram'].id },
      });
    }
  };

  private updateSocialsLink = async (
    social_link: string,
    social_name: string,
    user_id: string,
  ) => {
    await this.prismaService.userSocials.upsert({
      where: {
        social_name_user_id: {
          social_name,
          user_id,
        },
      },
      update: { social_link },
      create: {
        social_name,
        social_link,
        user: {
          connect: {
            id: user_id,
          },
        },
      },
    });
  };

  private updateEducations = async (
    updateEducationsDto: UpdateEducationsDto[],
    user_id: string,
  ) => {
    const existingUserEducations =
      await this.prismaService.userEducations.findMany({
        where: {
          user_id,
        },
      });

    await this.syncList(
      existingUserEducations,
      updateEducationsDto.map((edu) => ({
        ...edu,
        end_date: edu?.end_date ? edu.end_date : null,
      })),
      {
        idKey: 'id',
        isTempId: (id) => id?.toString().startsWith('temp'),
        compareFields: (a, b) => {
          const isEndDateEqual =
            (a.end_date === null && b.end_date === null) ||
            (a.end_date !== null &&
              b.end_date !== null &&
              new Date(a.end_date).getTime() ===
                new Date(b.end_date).getTime());

          return (
            a.school_name === b.school_name &&
            a.degree === b.degree &&
            a.major === b.major &&
            new Date(a.start_date).getTime() ===
              new Date(b.start_date).getTime() &&
            isEndDateEqual
          );
        },
        onCreate: (edu) =>
          this.prismaService.userEducations.create({
            data: {
              school_name: edu.school_name,
              degree: edu.degree,
              major: edu.major,
              start_date: new Date(edu.start_date),
              ...(edu.end_date && { end_date: new Date(edu.end_date) }),
              user: { connect: { id: user_id } },
            },
          }),
        onUpdate: (edu) =>
          this.prismaService.userEducations.update({
            where: { id: edu.id },
            data: {
              school_name: edu.school_name,
              degree: edu.degree,
              major: edu.major,
              start_date: new Date(edu.start_date),
              ...(edu.end_date && { end_date: new Date(edu.end_date) }),
            },
          }),
        onDelete: (edu) =>
          this.prismaService.userEducations.delete({
            where: { id: edu.id },
          }),
      },
    );
  };

  private updateWorkPlaces = async (
    updateWorkPlacesDto: UpdateWorkPlaceDto[],
    user_id: string,
  ) => {
    const existingUserWorkPlaces =
      await this.prismaService.userWorkPlaces.findMany({
        where: {
          user_id,
        },
      });

    await this.syncList(
      existingUserWorkPlaces,
      updateWorkPlacesDto.map((wp) => ({
        ...wp,
        end_date: wp?.end_date ? wp.end_date : null,
      })),
      {
        idKey: 'id',
        isTempId: (id) => id?.toString().startsWith('temp'),
        compareFields: (a, b) => {
          const isEndDateEqual =
            (a.end_date === null && b.end_date === null) ||
            (a.end_date !== null &&
              b.end_date !== null &&
              new Date(a.end_date).getTime() ===
                new Date(b.end_date).getTime());

          return (
            a.company_name === b.company_name &&
            a.position === b.position &&
            new Date(a.start_date).getTime() ===
              new Date(b.start_date).getTime() &&
            isEndDateEqual
          );
        },
        onCreate: (wp) =>
          this.prismaService.userWorkPlaces.create({
            data: {
              position: wp.position,
              company_name: wp.company_name,
              start_date: new Date(wp.start_date),
              ...(wp.end_date && { end_date: new Date(wp.end_date) }),
              user: { connect: { id: user_id } },
            },
          }),
        onUpdate: (wp) =>
          this.prismaService.userWorkPlaces.update({
            where: { id: wp.id },
            data: {
              position: wp.position,
              company_name: wp.company_name,
              start_date: new Date(wp.start_date),
              ...(wp.end_date && { end_date: new Date(wp.end_date) }),
            },
          }),
        onDelete: (wp) =>
          this.prismaService.userWorkPlaces.delete({
            where: { id: wp.id },
          }),
      },
    );
  };

  private updateInfoDetails = async (
    updateInfoDetailsDto: UpdateInfoDetailsDto,
    user_id: string,
  ) => {
    const { username } = updateInfoDetailsDto;

    if (username?.trim() !== '') {
      const existingUsername = await this.prismaService.userProfiles.findUnique(
        {
          where: {
            username,
          },
        },
      );

      if (existingUsername && existingUsername.user_id !== user_id)
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Username is already taken by another user.`,
        });
    }

    await this.prismaService.userProfiles.update({
      where: {
        user_id,
      },
      data: {
        ...updateInfoDetailsDto,
        nickname: updateInfoDetailsDto?.nickname
          ? updateInfoDetailsDto.nickname
          : null,
        bio: updateInfoDetailsDto?.bio ? updateInfoDetailsDto.bio : null,
      },
    });
  };

  private syncList = async <T extends Record<string, any>>(
    existing: T[],
    incoming: T[],
    options: SyncOptions<T>,
  ) => {
    const { idKey, compareFields, isTempId, onCreate, onUpdate, onDelete } =
      options;

    const existingMap = new Map(existing.map((item) => [item[idKey], item]));

    const toAdd = incoming.filter(
      (item) =>
        !item[idKey] || isTempId(item[idKey]) || !existingMap.has(item[idKey]),
    );

    const toUpdate = incoming.filter((item) => {
      const current = existingMap.get(item[idKey]);

      return current && !compareFields(current, item);
    });

    const toDelete = existing.filter(
      (item) => !incoming.some((i) => i[idKey] === item[idKey]),
    );

    await Promise.all(toAdd.map(onCreate));
    await Promise.all(toUpdate.map(onUpdate));
    await Promise.all(toDelete.map(onDelete));
  };

  public verifyUserPassword = async (
    currentPassword: string,
    email: string,
  ) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      select: {
        password: true,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    if (!user.password)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Password recovery is not available for non-local accounts.`,
      });

    return verifyPassword(currentPassword, user.password);
  };

  public createUserSession = async (
    createUserSessionDto: CreateUserSessionDto,
  ) => {
    const { user_id, finger_print, refresh_token } = createUserSessionDto;

    await this.prismaService.userSessions.upsert({
      where: {
        user_id_finger_print: {
          user_id,
          finger_print,
        },
      },
      update: {
        last_login_at: new Date(),
        refresh_token,
        expires_at: new Date(new Date().getTime() + REFRESH_TOKEN_LIFE),
        status: SessionStatusEnum.active,
      },
      create: createUserSessionDto,
    });
  };

  public getUserDevice = async (userId: string, fingerPrint: string) => {
    const device = await this.prismaService.userDevices.findUnique({
      where: {
        finger_print_user_id: {
          finger_print: fingerPrint,
          user_id: userId,
        },
      },
    });

    if (!device)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Your device could not be recognized. Please log in again.',
      });

    return device;
  };

  public getUserSession = async (user_id: string, finger_print: string) => {
    const session = await this.prismaService.userSessions.findUnique({
      where: {
        user_id_finger_print: {
          user_id,
          finger_print,
        },
      },
    });

    if (!session || session?.status !== SessionStatusEnum.active)
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Your session has expired. Please log in again.',
      });

    return session;
  };

  public deactivateOtherSessions = async (
    user_id: string,
    exludeFingerPrint: string,
  ) => {
    await this.prismaService.userSessions.updateMany({
      where: {
        user_id,
        finger_print: {
          not: exludeFingerPrint,
        },
      },
      data: {
        status: SessionStatusEnum.inactive,
      },
    });
  };

  public updateUserSession = async (
    updateUserSessionDto: UpdateUserSessionDto,
  ) => {
    const { user_id, finger_print, status } = updateUserSessionDto;

    await this.prismaService.userSessions.update({
      where: {
        user_id_finger_print: {
          user_id,
          finger_print,
        },
      },
      data: {
        status,
      },
    });
  };

  public handleGetUserByField = async (
    field: 'email' | 'phone_number' | 'id' | 'username',
    value: string,
    getUserQueryDto: GetUserQueryDto,
  ) => {
    const relations = [
      'profile',
      'followings',
      'groups',
      'targets',
      'educations',
      'work_places',
      'socials',
      'posts',
    ];

    const include = relations.reduce((acc, relation) => {
      const fieldName = `include${toPascalCase(relation)}`;
      if (getUserQueryDto?.[fieldName]) {
        acc[relation] = true;
      }
      return acc;
    }, {});

    let findUser: any;

    if (field === 'id') {
      findUser = await this.prismaService.users.findUnique({
        where: { id: value },
        include,
      });
    } else if (field === 'email') {
      findUser = await this.prismaService.users.findUnique({
        where: { email: value },
        include,
      });
    } else if (field === 'phone_number' || field === 'username') {
      findUser = await this.prismaService.users.findFirst({
        where: {
          profile: {
            ...(field === 'phone_number'
              ? { phone_number: value }
              : { username: value }),
          },
        },
        include,
      });
    } else {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Invalid field`,
      });
    }

    if (!findUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This ${fieldDisplayMap[field] || field} has not been registered.`,
      });

    return findUser;
  };

  public updateStatus2Fa = async (email: string, action: Verify2FaActions) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    await this.prismaService.users.update({
      where: {
        email,
      },
      data: {
        two_factor_enabled:
          action === Verify2FaActions.ENABLE_2FA ? true : false,
      },
    });
  };

  public updateUserImage = async (
    user_id: string,
    uploadUserImageQueryDto: UploadUserImageQueryDto,
    fileUrl: string,
  ) => {
    const { type } = uploadUserImageQueryDto;

    const userProfile = await this.prismaService.userProfiles.findFirst({
      where: {
        user: {
          id: user_id,
        },
      },
    });

    if (!userProfile)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    await this.prismaService.userProfiles.update({
      where: {
        id: userProfile.id,
      },
      data: {
        ...(type === UploadUserImageTypeEnum.AVATAR
          ? {
              avatar_url: fileUrl,
            }
          : {
              cover_photo_url: fileUrl,
            }),
      },
    });

    console.log('Hello World!');

    await this.createPhotoOfUser(
      {
        url: fileUrl,
        type: PhotoTypeEnum.AVATAR,
        privacy: PostPrivaciesEnum.public,
      },
      user_id,
    );
  };

  public getMyFeed = async (
    username: string,
    getPostQueryDto: GetPostQueryDto,
    email: string,
  ) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const userProfile = await this.prismaService.userProfiles.findUnique({
      where: {
        username,
      },
      include: {
        user: true,
      },
    });

    if (!userProfile)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    return sendWithTimeout(this.postsClient, 'get-profile-posts', {
      user_id: userProfile.user.id,
      getPostQueryDto,
      current_user_id: user.id,
    });
  };

  public getFriends = async (email: string) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        blockedBy: true,
        blockedUsers: true,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const blockedUserIds = Array.from(
      new Set([
        ...user.blockedUsers.map((u) => u.blocked_user_id),
        ...user.blockedBy.map((u) => u.user_id),
      ]),
    );

    const friends = await this.prismaService.friends.findMany({
      where: {
        OR: [
          {
            initiator_id: user.id,
            target_id: {
              notIn: blockedUserIds,
            },
          },
          {
            target_id: user.id,
            initiator_id: {
              notIn: blockedUserIds,
            },
          },
        ],
        friendship_status: FriendShipEnum.accepted,
      },
      select: {
        initiator_id: true,
        target_id: true,
      },
    });

    return friends.map((friend) =>
      friend.initiator_id === user.id ? friend.target_id : friend.initiator_id,
    );
  };

  public handleCheckFriendship = async (userId1: string, userId2: string) => {
    const friendship = await this.prismaService.friends.findFirst({
      where: {
        OR: [
          {
            initiator_id: userId1,
            target_id: userId2,
          },
          {
            initiator_id: userId2,
            target_id: userId1,
          },
        ],
        friendship_status: FriendShipEnum.accepted,
      },
    });

    return !!friendship;
  };

  public createFriendRequest = async (
    email: string,
    createFriendRequestDto: CreateFriendRequestDto,
  ) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const { target_id } = createFriendRequestDto;

    const targetUser = await this.prismaService.users.findUnique({
      where: {
        id: target_id,
      },
      include: {
        blockedUsers: true,
      },
    });

    if (!targetUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The user you're trying to send a friend request to does not exist. Please try again.`,
      });

    if (
      targetUser?.blockedUsers?.length &&
      !targetUser.blockedUsers.some((bu) => bu.blocked_user_id !== user.id)
    )
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `The user you're trying to send a friend request to has blocked you. Please try again.`,
      });

    const newFriendRequest = await this.prismaService.friends.create({
      data: {
        initiator_id: user.id,
        target_id,
      },
      include: {
        initiator: {
          include: {
            profile: true,
          },
        },
        target: {
          include: {
            profile: true,
          },
        },
      },
    });

    const createNotificationDto: CreateNotificationDto = {
      type: NotificationTypeEnum.friend_request,
      content: generateNotificationMessage(
        NotificationTypeEnum.friend_request,
        {
          senderName: `${user.profile?.first_name ?? ''} ${user.profile?.last_name ?? ''}`,
        },
      ),
      recipient_id: targetUser.id,
      sender_id: user.id,
      metadata: {
        initiator: {
          username: newFriendRequest.initiator.profile?.username ?? '',
          id: newFriendRequest.initiator_id,
        },
        target: {
          username: newFriendRequest.target.profile?.username ?? '',
          id: newFriendRequest.target_id,
        },
      },
    };

    this.notificationsClient.emit('create-notification', createNotificationDto);

    return this.getFormattedFriendRequest(
      newFriendRequest.initiator_id,
      newFriendRequest.target_id,
      true,
    );
  };

  private getFormattedFriendRequest = async (
    initiator_id: string,
    target_id: string,
    isInitiator = true,
  ) => {
    const request = await this.prismaService.friends.findFirst({
      where: {
        OR: [
          {
            initiator_id,
            target_id,
          },
          {
            initiator_id: target_id,
            target_id: initiator_id,
          },
        ],
      },
    });

    return {
      status: request?.friendship_status,
      isInitiator,
      initiatorId: request?.initiator_id,
      targetId: request?.target_id,
      confirmed_at: request?.confirmed_at,
      initiated_at: request?.initiated_at,
    };
  };

  public responseFriendRequest = async (
    email: string,
    responseFriendRequestDto: ResponseFriendRequestDto,
  ) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const { action, initiator_id } = responseFriendRequestDto;

    const initiatorUser = await this.prismaService.users.findUnique({
      where: {
        id: initiator_id,
      },
      include: {
        profile: true,
      },
    });

    if (!initiatorUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The user who sent the friend request could not be found.`,
      });

    const friendRequest = await this.prismaService.friends.findUnique({
      where: {
        initiator_id_target_id: {
          initiator_id,
          target_id: user.id,
        },
      },
    });

    if (!friendRequest)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The friend request you're trying to respond to does not exist or may have been removed.`,
      });

    if (friendRequest.friendship_status === FriendShipEnum.accepted)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `This friend request has already been accepted.`,
      });

    if (action === ResponseFriendRequestAction.ACCEPT) {
      const updatedFriendship = await this.prismaService.friends.update({
        where: {
          initiator_id_target_id: {
            initiator_id,
            target_id: user.id,
          },
        },
        data: {
          confirmed_at: new Date(),
          friendship_status: FriendShipEnum.accepted,
        },
      });

      this.createFriendRequestResponsNotification(
        NotificationTypeEnum.friend_request_accepted,
        user,
        initiatorUser,
      );

      return {
        status: updatedFriendship.friendship_status,
        isInitiator: updatedFriendship?.initiator_id === user.id,
        initiatorId: updatedFriendship?.initiator_id,
        targetId: updatedFriendship?.target_id,
        initiated_at: updatedFriendship?.initiated_at,
        confirmed_at: updatedFriendship?.confirmed_at,
      };
    } else {
      await this.prismaService.friends.delete({
        where: {
          initiator_id_target_id: {
            initiator_id,
            target_id: user.id,
          },
        },
      });

      this.createFriendRequestResponsNotification(
        NotificationTypeEnum.friend_request_rejected,
        user,
        initiatorUser,
      );

      return {
        status: 'none',
        isInitiator: false,
      };
    }
  };

  public getProfile = async (
    username: string,
    email: string,
    getUserQueryDto: GetUserQueryDto,
  ) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
        blockedUsers: true,
        blockedBy: true,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const findUser = await this.prismaService.userProfiles.findUnique({
      where: {
        username,
      },
      include: {
        user: true,
      },
    });

    if (
      !findUser ||
      user.blockedUsers.some((bu) => bu.blocked_user_id === findUser.user_id) ||
      user.blockedBy.some((bb) => bb.user_id === findUser.user_id)
    )
      return null;

    let relationship: any;

    let friendStatus: 'none' | FriendShipEnum = 'none';

    if (findUser.id !== user.id) {
      relationship = await this.getFriendRelationship(
        user.id,
        findUser.user_id,
      );

      if (relationship)
        friendStatus =
          relationship.friendship_status === FriendShipEnum.accepted
            ? FriendShipEnum.accepted
            : FriendShipEnum.pending;
    }

    if (findUser.user.email && user.email)
      return {
        ...(await this.handleGetMe(user.email, getUserQueryDto)),
        ...(user.id !== findUser.user_id && {
          relationship: {
            status: friendStatus,
            isInitiator: relationship?.initiator_id === user.id,
            initiatorId: relationship?.initiator_id,
            targetId: relationship?.target_id,
            initiated_at: relationship?.initiated_at,
            confirmed_at: relationship?.confirmed_at,
          },
        }),
      };
  };

  public getFriendRelationship = async (
    initiator_id: string,
    target_id: string,
  ) => {
    return this.prismaService.friends.findFirst({
      where: {
        OR: [
          {
            initiator_id,
            target_id,
          },
          {
            initiator_id: target_id,
            target_id: initiator_id,
          },
        ],
      },
    });
  };

  public deleteFriendRequest = async (email: string, target_id: string) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const targetUser = await this.prismaService.users.findUnique({
      where: {
        id: target_id,
      },
      include: {
        blockedUsers: true,
      },
    });

    if (!targetUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The user you're trying to cancel the friend request does not exist. Please try again.`,
      });

    if (
      targetUser?.blockedUsers?.length &&
      !targetUser.blockedUsers.some((bu) => bu.blocked_user_id !== user.id)
    )
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `The user you're trying to cancel the friend request has blocked you. Please try again.`,
      });

    const request = await this.prismaService.friends.findFirst({
      where: {
        OR: [
          {
            initiator_id: user.id,
            target_id,
          },
          {
            initiator_id: target_id,
            target_id: user.id,
          },
        ],
      },
    });

    if (!request)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Friend request not found. Unable to cancel.`,
      });

    await this.prismaService.friends.delete({
      where: {
        initiator_id_target_id: {
          initiator_id: request.initiator_id,
          target_id: request.target_id,
        },
      },
    });

    return {
      status: 'none',
      isInitiator: false,
    };
  };

  public getFriendRequests = async (
    email: string,
    getFriendRequestsQueryDto?: GetFriendRequestsQueryDto,
  ) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const limit = getFriendRequestsQueryDto?.limit ?? 4;

    const decodedCursor = getFriendRequestsQueryDto?.after
      ? this.decodeCursor(getFriendRequestsQueryDto.after)
      : null;

    const friendRequests = await this.prismaService.friends.findMany({
      where: {
        target_id: user.id,
        friendship_status: FriendShipEnum.pending,
      },
      include: {
        initiator: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: [
        {
          initiated_at: 'desc',
        },
      ],
      take: limit + 1,
      ...(decodedCursor && {
        cursor: {
          initiator_id_target_id: {
            initiator_id: decodedCursor.initiatorId,
            target_id: decodedCursor.targetId,
          },
        },
        skip: 1,
      }),
    });

    const hasNextPage = friendRequests.length > limit;

    const items = hasNextPage ? friendRequests.slice(0, -1) : friendRequests;

    return {
      data: items.map((item) => ({
        friendship_status: item.friendship_status,
        initiator_id: item.initiator_id,
        initiated_at: item.initiated_at,
        confirmed_at: item?.confirmed_at,
        initiator: {
          id: item.initiator.id,
          full_name: `${item.initiator.profile?.first_name ?? ''} ${item.initiator.profile?.last_name ?? ''}`,
          avatar_url: item.initiator.profile?.avatar_url ?? '',
          username: item.initiator.profile?.username ?? '',
        },
      })),
      nextCursor: hasNextPage
        ? this.encodeCursor(
            items[items.length - 1].initiator_id,
            items[items.length - 1].target_id,
          )
        : null,
    };
  };

  public encodeCursor = (initiatorId: string, targetId: string): string => {
    return Buffer.from(`${initiatorId}::${targetId}`).toString('base64');
  };

  public decodeCursor = (
    cursor: string,
  ): { initiatorId: string; targetId: string } => {
    const [initiatorId, targetId] = Buffer.from(cursor, 'base64')
      .toString('utf8')
      .split('::');

    return { initiatorId, targetId };
  };

  public getFriendsList = async (
    email: string,
    getFriendsListQueryDto: GetFriendsListQueryDto,
  ) => {
    const { username, type } = getFriendsListQueryDto;

    const findUser = await this.prismaService.userProfiles.findUnique({
      where: {
        username,
      },
    });

    if (!findUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The user whose friend list you're trying to view does not exist. Please try again.`,
      });

    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        blockedBy: true,
        blockedUsers: true,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    if (
      (type === FriendListType.REQUESTS ||
        type === FriendListType.SUGGESTIONS) &&
      user.id !== findUser.user_id
    )
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not authorized to access this list for another user.',
      });

    const limit = getFriendsListQueryDto?.limit ?? 10;
    const after = getFriendsListQueryDto?.after;

    if (type === FriendListType.REQUESTS)
      return this.getFriendRequests(email, {
        limit,
        after,
      });

    if (type === FriendListType.SUGGESTIONS)
      return this.getFriendSuggesstions(email, {
        limit,
        after,
      });

    const decodedCursor = after ? this.decodeCursor(after) : null;

    const blockedUserIds = Array.from(
      new Set([
        ...user.blockedUsers.map((u) => u.blocked_user_id),
        ...user.blockedBy.map((u) => u.user_id),
      ]),
    );

    const totalFriends = await this.prismaService.friends.count({
      where: {
        OR: [
          {
            initiator_id: findUser.user_id,
            target_id: {
              notIn: blockedUserIds,
            },
          },
          {
            target_id: findUser.user_id,
            initiator_id: {
              notIn: blockedUserIds,
            },
          },
        ],
        friendship_status: FriendShipEnum.accepted,
      },
    });

    const friends = await this.prismaService.friends.findMany({
      where: {
        friendship_status: FriendShipEnum.accepted,
        OR: [
          {
            initiator_id: findUser.user_id,
            target_id: {
              notIn: blockedUserIds,
            },
          },
          {
            target_id: findUser.user_id,
            initiator_id: {
              notIn: blockedUserIds,
            },
          },
        ],
      },
      include: {
        target: {
          include: {
            profile: true,
          },
        },
        initiator: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: [
        {
          initiated_at: 'desc',
        },
      ],
      take: limit + 1,
      ...(decodedCursor && {
        cursor: {
          initiator_id_target_id: {
            initiator_id: decodedCursor.initiatorId,
            target_id: decodedCursor.targetId,
          },
        },
        skip: 1,
      }),
    });

    const fullNameQuery = getFriendsListQueryDto?.full_name?.toLowerCase();

    const filteredFriends = fullNameQuery
      ? friends.filter((item) => {
          const isInitiator = findUser.user_id === item.initiator_id;

          const profile = isInitiator
            ? item.target.profile
            : item.initiator.profile;

          const fullName =
            `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.toLowerCase();

          return fullName.includes(fullNameQuery);
        })
      : friends;

    const hasNextPage = filteredFriends.length > limit;

    const items = hasNextPage ? filteredFriends.slice(0, -1) : filteredFriends;

    return {
      data: await Promise.all(
        items.map(async (item) => {
          const isInitiator = findUser.user_id === item.initiator_id;
          return {
            user_id: isInitiator ? item.target_id : item.initiator_id,
            full_name: isInitiator
              ? `${item.target.profile?.first_name ?? ''} ${item.target.profile?.last_name ?? ''}`
              : `${item.initiator.profile?.first_name ?? ''} ${item.initiator.profile?.last_name ?? ''}`,
            username: isInitiator
              ? item.target.profile?.username
              : item.initiator.profile?.username,
            avatar_url: isInitiator
              ? item.target.profile?.avatar_url
              : item.initiator.profile?.avatar_url,
            mutual_friends: isInitiator
              ? await this.getMutualFriendsCount(user.id, item.target_id)
              : await this.getMutualFriendsCount(user.id, item.initiator_id),
            is_friend: isInitiator
              ? await this.isHasFriendWithCurrentUser(user.id, item.target_id)
              : await this.isHasFriendWithCurrentUser(
                  user.id,
                  item.initiator_id,
                ),
          };
        }),
      ),
      total_friends: totalFriends,
      nextCursor: hasNextPage
        ? this.encodeCursor(
            items[items.length - 1].initiator_id,
            items[items.length - 1].target_id,
          )
        : null,
    };
  };

  public getMutualFriendsCount = async (
    currentUserId: string,
    targetId: string,
  ) => {
    const currentUserFriends = await this.prismaService.friends.findMany({
      where: {
        friendship_status: FriendShipEnum.accepted,
        OR: [{ initiator_id: currentUserId }, { target_id: currentUserId }],
      },
      select: {
        initiator_id: true,
        target_id: true,
      },
    });

    const targetUserFriends = await this.prismaService.friends.findMany({
      where: {
        friendship_status: FriendShipEnum.accepted,
        OR: [{ initiator_id: targetId }, { target_id: targetId }],
      },
      select: {
        initiator_id: true,
        target_id: true,
      },
    });

    const extractFriendIds = (userId: string, list: any[]) =>
      list.map((f) =>
        f.initiator_id === userId ? f.target_id : f.initiator_id,
      );

    const currentUserFriendIds = extractFriendIds(
      currentUserId,
      currentUserFriends,
    );

    const targetUserFriendIds = extractFriendIds(targetId, targetUserFriends);

    const mutualFriendIds = currentUserFriendIds.filter((id) =>
      targetUserFriendIds.includes(id),
    );

    return mutualFriendIds.length;
  };

  private isHasFriendWithCurrentUser = async (
    currentUserId: string,
    targetId: string,
  ) => {
    const relationship = await this.prismaService.friends.findFirst({
      where: {
        OR: [
          {
            initiator_id: currentUserId,
            target_id: targetId,
          },
          {
            target_id: currentUserId,
            initiator_id: targetId,
          },
        ],
      },
    });

    if (!relationship) return false;

    return true;
  };

  public blockUser = async (email: string, targetUserId: string) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        blockedUsers: true,
        blockedBy: true,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const targetUser = await this.prismaService.users.findUnique({
      where: {
        id: targetUserId,
      },
      include: {
        profile: true,
      },
    });

    if (!targetUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The user you're trying to interact with does not exist. Please try again.`,
      });

    if (user.id === targetUser.id)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You are not allowed to block yourself.`,
      });

    if (user.blockedUsers.some((bu) => bu.blocked_user_id === targetUserId))
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `This person is already in your block list.`,
      });

    if (user.blockedBy.some((bb) => bb.user_id === targetUserId))
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `This person has already blocked you.`,
      });

    const existingFriendship = await this.prismaService.friends.findFirst({
      where: {
        OR: [
          {
            initiator_id: user.id,
            target_id: targetUserId,
          },
          {
            initiator_id: targetUserId,
            target_id: user.id,
          },
        ],
      },
    });

    if (existingFriendship)
      await this.prismaService.friends.delete({
        where: {
          initiator_id_target_id: {
            initiator_id: existingFriendship.initiator_id,
            target_id: existingFriendship.target_id,
          },
        },
      });

    await this.prismaService.blocks.create({
      data: {
        user_id: user.id,
        blocked_user_id: targetUserId,
      },
    });

    return {
      message: 'User has been successfully blocked.',
      blockedUserId: targetUserId,
      canUnblock: true,
    };
  };

  public getBlockedUsersList = async (
    email: string,
    getBlockedUsersListQueryDto?: GetBlockedUsersListQueryDto,
  ) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const limit = getBlockedUsersListQueryDto?.limit ?? 10;

    const decodedCursor = getBlockedUsersListQueryDto?.after
      ? this.decodeCursor(getBlockedUsersListQueryDto.after)
      : null;

    const blockedUsers = await this.prismaService.blocks.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        blockedUser: {
          include: {
            profile: true,
          },
        },
      },
      take: limit + 1,
      ...(decodedCursor && {
        cursor: {
          user_id_blocked_user_id: {
            user_id: decodedCursor.initiatorId,
            blocked_user_id: decodedCursor.targetId,
          },
        },
        skip: 1,
      }),
    });

    const hasNextPage = blockedUsers.length > limit;

    const items = hasNextPage ? blockedUsers.slice(0, -1) : blockedUsers;

    const nextCursor = hasNextPage
      ? this.encodeCursor(
          items[items.length - 1].user_id,
          items[items.length - 1].blocked_user_id,
        )
      : null;

    return {
      data: items.map((item) => ({
        user_id: item.blocked_user_id,
        full_name: `${item.blockedUser.profile?.first_name ?? ''} ${item.blockedUser.profile?.last_name ?? ''}`,
        avatar_url: item.blockedUser.profile?.avatar_url ?? '',
        username: item.blockedUser.profile?.username,
        blocked_at: item.blocked_at,
      })),
      nextCursor,
    };
  };

  public unblockUser = async (email: string, targetId: string) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        blockedUsers: true,
        blockedBy: true,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const targetUser = await this.prismaService.users.findUnique({
      where: {
        id: targetId,
      },
      include: {
        profile: true,
      },
    });

    if (!targetUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The user you're trying to interact with does not exist. Please try again.`,
      });

    if (user.id === targetUser.id)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You are not allowed to unblock yourself.`,
      });

    if (!user.blockedUsers.some((bu) => bu.blocked_user_id === targetId))
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'This person is not in your blocked users list.',
      });

    if (user.blockedBy.some((bb) => bb.user_id === targetId))
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `This person has already blocked you.`,
      });

    const blockRelationship = await this.prismaService.blocks.findUnique({
      where: {
        user_id_blocked_user_id: {
          user_id: user.id,
          blocked_user_id: targetId,
        },
      },
    });

    if (!blockRelationship)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This person is not in your blocked users list.`,
      });

    await this.prismaService.blocks.delete({
      where: {
        user_id_blocked_user_id: {
          user_id: blockRelationship.user_id,
          blocked_user_id: blockRelationship.blocked_user_id,
        },
      },
    });

    return {
      message: `User ${targetUser?.profile?.first_name ?? ''} ${targetUser?.profile?.last_name ?? ''} has been removed from your blocked list.`,
      canBlock: true,
    };
  };

  public getUsers = async (
    email: string,
    searchUserQueryDto: SearchUserQueryDto,
  ) => {
    function encodeCursor(data: { id: string }): string {
      return Buffer.from(JSON.stringify(data)).toString('base64');
    }

    function decodeCursor(cursor: string): { id: string } {
      return JSON.parse(Buffer.from(cursor, 'base64').toString());
    }

    const { full_name } = searchUserQueryDto;

    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        blockedBy: true,
        blockedUsers: true,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const limit = searchUserQueryDto?.limit ?? 10;

    const decodedCursor = searchUserQueryDto?.after
      ? decodeCursor(searchUserQueryDto.after)
      : null;

    const blockedUserIds = Array.from(
      new Set([
        ...user.blockedUsers.map((u) => u.blocked_user_id),
        ...user.blockedBy.map((u) => u.user_id),
      ]),
    );

    const profiles = await this.prismaService.userProfiles.findMany({
      where: {
        user_id: {
          not: user.id,
          notIn: blockedUserIds,
        },
        OR: [
          {
            first_name: {
              contains: full_name,
              mode: 'insensitive',
            },
          },
          {
            last_name: {
              contains: full_name,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      take: limit + 1,
      ...(decodedCursor && {
        cursor: {
          id: decodedCursor.id,
        },
        skip: 1,
      }),
      orderBy: {
        id: 'desc',
      },
    });

    const hasNextPage = profiles.length > limit;

    const items = hasNextPage ? profiles.slice(0, -1) : profiles;

    const nextCursor = hasNextPage
      ? encodeCursor({ id: items[items.length - 1].id })
      : null;

    return {
      data: items.map((item) => ({
        id: item.user_id,
        full_name: `${item.first_name ?? ''} ${item.last_name ?? ''}`,
        avatar_url: item.avatar_url ?? '',
        username: item.username ?? '',
      })),
      nextCursor,
    };
  };

  public getUsersByIds = async (userIds: string[]) => {
    return Promise.all(
      userIds.map(async (userId) => {
        const user = await this.prismaService.users.findUnique({
          where: {
            id: userId,
          },
          include: {
            profile: true,
          },
        });

        return user ? omit(user, ['password']) : null;
      }),
    );
  };

  private createFriendRequestResponsNotification = (
    type: NotificationTypeEnum,
    user: any,
    recipient: any,
  ) => {
    const createNotificationDto: CreateNotificationDto = {
      type,
      content: generateNotificationMessage(type, {
        senderName: `${user.profile?.first_name ?? ''} ${user.profile?.last_name ?? ''}`,
      }),
      recipient_id: recipient.id,
      sender_id: user.id,
      metadata: {
        initiator: {
          username: recipient.profile?.username ?? '',
          id: recipient.id,
        },
        target: {
          username: user.profile.username ?? '',
          id: user.id,
        },
      },
    };

    this.notificationsClient.emit('create-notification', createNotificationDto);
  };

  private getFriendSuggesstions = async (
    email: string,
    getFriendSuggestionsQueryDto?: {
      limit?: number;
      after?: string;
    },
  ) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    function encodeCursor(userId: string): string {
      return Buffer.from(userId).toString('base64');
    }

    function decodeCursor(cursor: string): string {
      return Buffer.from(cursor, 'base64').toString('utf8');
    }

    const userIds = [...(await this.getFriends(email)), user.id];

    const pendingRequests = await this.prismaService.friends.findMany({
      where: {
        OR: [{ initiator_id: user.id }, { target_id: user.id }],
        friendship_status: FriendShipEnum.pending,
      },
      select: {
        initiator_id: true,
        target_id: true,
      },
    });

    const pendingUserIds = pendingRequests.map((f) =>
      f.initiator_id === user.id ? f.target_id : f.initiator_id,
    );

    const excludedUserIds = [...userIds, ...pendingUserIds];

    const limit = getFriendSuggestionsQueryDto?.limit ?? 10;

    const decodedCursor = getFriendSuggestionsQueryDto?.after
      ? decodeCursor(getFriendSuggestionsQueryDto.after)
      : null;

    const friendSuggestions = await this.prismaService.users.findMany({
      where: {
        id: {
          not: {
            in: excludedUserIds,
          },
        },
      },
      take: limit + 1,
      orderBy: [
        {
          id: 'desc',
        },
      ],
      ...(decodedCursor && {
        cursor: {
          id: decodedCursor,
        },
        skip: 1,
      }),
      include: {
        profile: true,
      },
    });

    const hasNextPage = friendSuggestions.length > limit;

    const items = hasNextPage
      ? friendSuggestions.slice(0, -1)
      : friendSuggestions;

    const nextCursor = hasNextPage
      ? encodeCursor(items[items.length - 1].id)
      : null;

    return {
      data: await Promise.all(
        items.map(async (item) => ({
          user_id: item.id,
          full_name: `${item.profile?.first_name ?? ''} ${item.profile?.last_name ?? ''}`,
          avatar_url: `${item.profile?.avatar_url ?? ''}`,
          username: item.profile?.username ?? '',
          mutual_friends: await this.getMutualFriendsCount(user.id, item.id),
        })),
      ),
      nextCursor,
    };
  };

  public getUsersByFullName = async (full_name: string) => {
    const userProfiles = await this.prismaService.userProfiles.findMany({
      where: {
        OR: [
          {
            first_name: {
              contains: full_name,
              mode: 'insensitive',
            },
          },
          {
            last_name: {
              contains: full_name,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    return userProfiles;
  };

  public createPhotoOfUser = async (
    createPhotoOfUserDto: CreatePhotoOfUserDto,
    user_id: string,
  ) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with id '${user_id} not found.'`,
      });

    await this.prismaService.photos.create({
      data: {
        ...createPhotoOfUserDto,
        user: {
          connect: {
            id: user_id,
          },
        },
      },
    });
  };

  public getPhotosOfUser = async (
    email: string,
    getPhotosOfUserQueryDto: GetPhotosOfUserQueryDto,
  ) => {
    const user = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Your email has not been registered.`,
      });

    const { username } = getPhotosOfUserQueryDto;

    const findUser = await this.prismaService.userProfiles.findUnique({
      where: {
        username,
      },
    });

    if (!findUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with username '${username}' not found.`,
      });

    const limit = getPhotosOfUserQueryDto?.limit ?? 10;

    const decodedCursor = getPhotosOfUserQueryDto?.after
      ? decodeCursor(getPhotosOfUserQueryDto.after)
      : null;

    const isOwner = findUser.user_id === user.id;

    const isFriend = await this.handleCheckFriendship(user.id, findUser.id);

    let privacyFilter: { privacy: { in: PostPrivaciesEnum[] } } | undefined;

    if (!isOwner) {
      privacyFilter = {
        privacy: {
          in: isFriend
            ? [PostPrivaciesEnum.public, PostPrivaciesEnum.only_friend]
            : [PostPrivaciesEnum.public],
        },
      };
    }

    const photos = await this.prismaService.photos.findMany({
      where: {
        user_id: findUser.user_id,
        deleted_at: null,
        ...(privacyFilter ?? {}),
      },
      take: limit + 1,
      orderBy: [
        {
          created_at: 'desc',
        },
        {
          user_id: 'desc',
        },
      ],
      ...(decodedCursor && {
        cursor: {
          id: decodedCursor.id,
          created_at: decodedCursor.created_at,
        },
        skip: 1,
      }),
    });

    const hasNextPage = photos.length > limit;

    const items = hasNextPage ? photos.slice(0, -1) : photos;

    const nextCursor = hasNextPage
      ? encodeCursor({
          id: items[items.length - 1].id,
          created_at: items[items.length - 1].created_at,
        })
      : null;

    return {
      data: items,
      nextCursor,
    };
  };
}
