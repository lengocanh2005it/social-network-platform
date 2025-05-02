import { UpdatePasswordDto } from '@app/common/dtos/auth';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { GetUserQueryDto } from '@app/common/dtos/users';

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
}
