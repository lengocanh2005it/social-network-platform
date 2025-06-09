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
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { instanceToPlain } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

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
    return firstValueFrom(
      this.authClient.send('sign-in', instanceToPlain(signInDto)),
    );
  };

  public signUp = async (signUpDto: SignUpDto, userIp?: string) => {
    return firstValueFrom(
      this.authClient.send('sign-up', {
        signUpDto,
        userIp,
      }),
    );
  };

  public verifyOtp = async (verifyOtpDto: VerifyOtpDto) => {
    return firstValueFrom(this.authClient.send('verify-otp', verifyOtpDto));
  };

  public forgotPassword = async (forgotPasswordDto: ForgotPasswordDto) => {
    return firstValueFrom(
      this.authClient.send('forgot-password', forgotPasswordDto),
    );
  };

  public resetPassword = async (resetPasswordDto: ResetPasswordDto) => {
    return firstValueFrom(
      this.authClient.send('reset-password', resetPasswordDto),
    );
  };

  public oAuthCallback = async (oAuthCallbackDto: OAuthCallbackDto) => {
    return firstValueFrom(
      this.authClient.send('oauth-callback', oAuthCallbackDto),
    );
  };

  public getInfoOAuthCallback = async (
    getInfoOAuthCallbackDto: GetInfoOAuthCallbackDto,
  ) => {
    return firstValueFrom(
      this.authClient.send('get-info-oauth-callback', getInfoOAuthCallbackDto),
    );
  };

  public handleGenerateToken = async (generateTokenDto: GenerateTokenDto) => {
    return firstValueFrom(
      this.authClient.send('generate-token', generateTokenDto),
    );
  };

  public handleVerifyToken = async (verifyTokenDto: VerifyTokenDto) => {
    return firstValueFrom(this.authClient.send('verify-token', verifyTokenDto));
  };

  public refreshToken = async (refreshToken: string, fingerPrint: string) => {
    return firstValueFrom(
      this.authClient.send('refresh-token', {
        refreshToken,
        fingerPrint,
      }),
    );
  };

  public changePassword = async (
    changePasswordDto: ChangePasswordDto,
    email: string,
    finger_print: string,
  ) => {
    return firstValueFrom(
      this.authClient.send('change-password', {
        changePasswordDto,
        email,
        finger_print,
      }),
    );
  };

  public signOut = async (signOutDto: SignOutDto) => {
    return firstValueFrom(this.authClient.send('sign-out', signOutDto));
  };

  public sendOtp = async (sendOtpDto: SendOtpDto) => {
    return firstValueFrom(this.authClient.send('send-otp', sendOtpDto));
  };

  public verifyAccountOwnership = async (
    verifyOwnershipOtpDto: VerifyOwnershipOtpDto,
  ) => {
    return firstValueFrom(
      this.authClient.send('verify-ownership-otp', verifyOwnershipOtpDto),
    );
  };

  public generate2FA = async (email: string) => {
    return firstValueFrom(this.authClient.send('generate-2fa', email));
  };

  public verify2FA = async (
    verify2FaDto: Verify2FaDto,
    fingerprint: string,
  ) => {
    return firstValueFrom(
      this.authClient.send('verify-2fa', {
        verify2FaDto,
        fingerprint,
      }),
    );
  };

  public trustDevice = (
    finger_print: string,
    trustDeviceDto: TrustDeviceDto,
  ) => {
    this.authClient.emit(
      'create-trust-device',
      JSON.stringify({
        finger_print,
        trustDeviceDto,
      }),
    );
  };
}
