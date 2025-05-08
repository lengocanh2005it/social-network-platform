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
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
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
    ];

    patterns.forEach((pattern) => {
      this.authClient.subscribeToResponseOf(pattern);
    });
  }

  public signIn = async (signInDto: SignInDto) => {
    return firstValueFrom(this.authClient.send('sign-in', signInDto));
  };

  public signUp = async (signUpDto: SignUpDto) => {
    return firstValueFrom(this.authClient.send('sign-up', signUpDto));
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

  public refreshToken = async (refreshToken: string) => {
    return firstValueFrom(this.authClient.send('refresh-token', refreshToken));
  };
}
