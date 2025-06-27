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
import { sendWithTimeout, toPlain } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'sign-in',
      'sign-up',
      'verify-otp',
      'forgot-password',
      'reset-password',
      'oauth-callback',
      'get-info-oauth-callback',
      'generate-token',
      'verify-token',
      'refresh-token',
      'change-password',
      'sign-out',
      'send-otp',
      'verify-ownership-otp',
      'generate-2fa',
      'verify-2fa',
    ];

    patterns.forEach((pattern) => {
      this.authClient.subscribeToResponseOf(pattern);
    });
  }

  public signIn = async (signInDto: SignInDto) => {
    return sendWithTimeout(this.authClient, 'sign-in', toPlain(signInDto));
  };

  public signUp = async (signUpDto: SignUpDto, userIp?: string) => {
    return sendWithTimeout(this.authClient, 'sign-up', {
      signUpDto: toPlain(signUpDto),
      userIp,
    });
  };

  public verifyOtp = async (verifyOtpDto: VerifyOtpDto) => {
    return sendWithTimeout(
      this.authClient,
      'verify-otp',
      toPlain(verifyOtpDto),
    );
  };

  public forgotPassword = async (forgotPasswordDto: ForgotPasswordDto) => {
    return sendWithTimeout(
      this.authClient,
      'forgot-password',
      toPlain(forgotPasswordDto),
    );
  };

  public resetPassword = async (resetPasswordDto: ResetPasswordDto) => {
    return sendWithTimeout(
      this.authClient,
      'reset-password',
      toPlain(resetPasswordDto),
    );
  };

  public oAuthCallback = async (oAuthCallbackDto: OAuthCallbackDto) => {
    return sendWithTimeout(
      this.authClient,
      'oauth-callback',
      toPlain(oAuthCallbackDto),
    );
  };

  public getInfoOAuthCallback = async (
    getInfoOAuthCallbackDto: GetInfoOAuthCallbackDto,
  ) => {
    return sendWithTimeout(
      this.authClient,
      'get-info-oauth-callback',
      toPlain(getInfoOAuthCallbackDto),
    );
  };

  public handleGenerateToken = async (generateTokenDto: GenerateTokenDto) => {
    return sendWithTimeout(
      this.authClient,
      'generate-token',
      toPlain(generateTokenDto),
    );
  };

  public handleVerifyToken = async (verifyTokenDto: VerifyTokenDto) => {
    return sendWithTimeout(
      this.authClient,
      'verify-token',
      toPlain(verifyTokenDto),
    );
  };

  public refreshToken = async (refreshToken: string, fingerPrint: string) => {
    return sendWithTimeout(this.authClient, 'refresh-token', {
      refreshToken,
      fingerPrint,
    });
  };

  public changePassword = async (
    changePasswordDto: ChangePasswordDto,
    email: string,
    finger_print: string,
  ) => {
    return sendWithTimeout(this.authClient, 'change-password', {
      changePasswordDto: toPlain(changePasswordDto),
      email,
      finger_print,
    });
  };

  public signOut = async (signOutDto: SignOutDto) => {
    return sendWithTimeout(this.authClient, 'sign-out', toPlain(signOutDto));
  };

  public sendOtp = async (sendOtpDto: SendOtpDto) => {
    return sendWithTimeout(this.authClient, 'send-otp', toPlain(sendOtpDto));
  };

  public verifyAccountOwnership = async (
    verifyOwnershipOtpDto: VerifyOwnershipOtpDto,
  ) => {
    return sendWithTimeout(
      this.authClient,
      'verify-ownership-otp',
      toPlain(verifyOwnershipOtpDto),
    );
  };

  public generate2FA = async (email: string) => {
    return sendWithTimeout(this.authClient, 'generate-2fa', email);
  };

  public verify2FA = async (
    verify2FaDto: Verify2FaDto,
    fingerprint: string,
  ) => {
    return sendWithTimeout(this.authClient, 'verify-2fa', {
      verify2FaDto: toPlain(verify2FaDto),
      fingerprint,
    });
  };

  public trustDevice = (
    finger_print: string,
    trustDeviceDto: TrustDeviceDto,
  ) => {
    this.authClient.emit(
      'create-trust-device',
      JSON.stringify({
        finger_print,
        trustDeviceDto: toPlain(trustDeviceDto),
      }),
    );
  };
}
