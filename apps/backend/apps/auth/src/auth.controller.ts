import {
  ChangePasswordDto,
  ForgotPasswordDto,
  GenerateTokenDto,
  GetInfoOAuthCallbackDto,
  OAuthCallbackDto,
  ResetPasswordDto,
  SendOtpDto,
  SignInDto,
  SignOutDto,
  SignUpDto,
  TrustDeviceDto,
  Verify2FaDto,
  VerifyOtpDto,
  VerifyOwnershipOtpDto,
  VerifyTokenDto,
} from '@app/common/dtos/auth';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('sign-in')
  async signIn(@Payload() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @MessagePattern('sign-up')
  async signUp(
    @Payload('signUpDto') signUpDto: SignUpDto,
    @Payload('userIp') userIp?: string,
  ) {
    return this.authService.signUp(signUpDto, userIp);
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

  @MessagePattern('refresh-token')
  async refreshToken(
    @Payload('refreshToken') refreshToken: string,
    @Payload('fingerPrint') fingerPrint: string,
  ) {
    return this.authService.refreshToken(refreshToken, fingerPrint);
  }

  @MessagePattern('change-password')
  async changePassword(
    @Payload('changePasswordDto') changePasswordDto: ChangePasswordDto,
    @Payload('email') email: string,
    @Payload('finger_print') fingerPrint: string,
  ) {
    return this.authService.changePassword(
      changePasswordDto,
      email,
      fingerPrint,
    );
  }

  @MessagePattern('sign-out')
  async signOut(@Payload() signOutDto: SignOutDto) {
    return this.authService.signOut(signOutDto);
  }

  @MessagePattern('send-otp')
  async sendOtp(@Payload() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @MessagePattern('verify-ownership-otp')
  async verifyOwnershipOtp(
    @Payload() verifyOwnershipOtpDto: VerifyOwnershipOtpDto,
  ) {
    return this.authService.verifyOwnershipOtp(verifyOwnershipOtpDto);
  }

  @MessagePattern('verify-2fa')
  async verify2Fa(
    @Payload('verify2FaDto') verif2FaDto: Verify2FaDto,
    @Payload('fingerprint') fingerprint: string,
  ) {
    return this.authService.verify2Fa(verif2FaDto, fingerprint);
  }

  @MessagePattern('generate-2fa')
  async generate2Fa(@Payload() email: string) {
    return this.authService.generate2Fa(email);
  }

  @EventPattern('create-trust-device')
  async createTrustDevice(
    @Payload('finger_print') finger_print: string,
    @Payload('trustDeviceDto') trustDeviceDto: TrustDeviceDto,
  ) {
    return this.authService.createTrustDevice(finger_print, trustDeviceDto);
  }
}
