import { UpdatePasswordDto } from '@app/common/dtos/auth';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @EventPattern('update-password')
  async updatePassword(@Payload() updatePasswordDto: UpdatePasswordDto) {
    return this.usersService.updatePassword(updatePasswordDto);
  }
}
