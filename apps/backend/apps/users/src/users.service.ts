import { UpdatePasswordDto } from '@app/common/dtos/auth';
import { GetUserQueryDto } from '@app/common/dtos/users';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { hashPassword, toPascalCase } from '@app/common/utils';
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
}
