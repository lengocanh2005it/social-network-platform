import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyOtpDto,
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
}
