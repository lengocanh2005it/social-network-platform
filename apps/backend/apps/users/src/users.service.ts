import { UpdatePasswordDto } from '@app/common/dtos/auth';
import {
  GetUserQueryDto,
  UpdateEducationsDto,
  UpdateInfoDetailsDto,
  UpdateSocialsLinkDto,
  UpdateUserProfileDto,
  UpdateWorkPlaceDto,
} from '@app/common/dtos/users';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { hashPassword, SyncOptions, toPascalCase } from '@app/common/utils';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { omit } from 'lodash';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

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
    getUserQueryDto?: GetUserQueryDto,
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

    const findUser = await this.prismaService.users.findUnique({
      where: { email },
      include,
    });

    if (!findUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'This user information not found.',
      });

    return omit(findUser, ['password']);
  };

  public updateUserProfile = async (
    updateUserProfileDto: UpdateUserProfileDto,
    email: string,
  ) => {
    const existingUserEmail = await this.prismaService.users.findUnique({
      where: {
        email,
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
    await this.prismaService.userProfiles.update({
      where: {
        user_id,
      },
      data: updateInfoDetailsDto,
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
}
