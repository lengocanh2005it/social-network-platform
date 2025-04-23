import { SignInDto, SignUpDto, VerifyOtpDto } from '@app/common/dtos/auth';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('sign-in')
  async signIn(@Payload() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @MessagePattern('sign-up')
  async signUp(@Payload() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @MessagePattern('verify-otp')
  async verifyOtp(@Payload() verifyOtp: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtp);
  }
}
