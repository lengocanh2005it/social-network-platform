import {
  ForgotPasswordDto,
  GenerateTokenDto,
  GetInfoOAuthCallbackDto,
  OAuthCallbackDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyOtpDto,
  VerifyTokenDto,
} from '@app/common/dtos/auth';
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

  @MessagePattern('forgot-password')
  async forgotPassword(@Payload() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @MessagePattern('reset-password')
  async resetPassword(@Payload() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @MessagePattern('oauth-callback')
  async oAuthCallback(@Payload() oAuthCallbackDto: OAuthCallbackDto) {
    return this.authService.oAuthCallback(oAuthCallbackDto);
  }

  @MessagePattern('get-info-oauth-callback')
  async getInfoOAuthCallback(
    @Payload() getInfoOAuthCallbackDto: GetInfoOAuthCallbackDto,
  ) {
    return this.authService.getInfoOAuthCallback(getInfoOAuthCallbackDto);
  }

  @MessagePattern('generate-token')
  async generateToken(@Payload() generateTokenDto: GenerateTokenDto) {
    return this.authService.generateToken(generateTokenDto);
  }

  @MessagePattern('verify-token')
  async verifyToken(@Payload() verifyTokenDto: VerifyTokenDto) {
    return this.authService.verifyToken(verifyTokenDto);
  }
}
