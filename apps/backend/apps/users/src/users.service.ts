import { UpdatePasswordDto } from '@app/common/dtos/auth';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { hashPassword } from '@app/common/utils';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

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
}
