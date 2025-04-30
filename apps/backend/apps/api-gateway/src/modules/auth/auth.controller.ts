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
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { initializeCookies } from '@app/common/utils';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const data = await this.authService.signIn(signInDto);

    if (data?.access_token && data?.refresh_token && data?.role) {
      const { access_token, refresh_token, role } = data;

      initializeCookies(res, { access_token, refresh_token, role });
    }

    return res.status(HttpStatus.CREATED).json(data);
  }

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('oauth/callback')
  async oAuthCallback(
    @Body() oAuthCallbackDto: OAuthCallbackDto,
    @Res() res: Response,
  ) {
    const data = await this.authService.oAuthCallback(oAuthCallbackDto);

    res.cookie('access_token', data.access_token, {
      httpOnly: true,
    });

    res.cookie('refresh_token', data.refresh_token, {
      httpOnly: true,
    });

    res.redirect(
      this.configService.get<string>('frontend_url', '') + '/home/dadadad',
    );

    //   return res.status(HttpStatus.CREATED).json(data);
  }

  @Post('oauth/callback/get-info')
  async getInfoOAuthCallback(
    @Body() getInfoOAuthCallbackDto: GetInfoOAuthCallbackDto,
    @Res() res: Response,
  ) {
    const data = await this.authService.getInfoOAuthCallback(
      getInfoOAuthCallbackDto,
    );

    if (
      data &&
      data?.access_token &&
      data?.refresh_token &&
      data?.role &&
      data?.provider
    ) {
      const { access_token, refresh_token, role } = data;

      initializeCookies(res, { access_token, refresh_token, role });
    }

    return res.status(HttpStatus.CREATED).json(data);
  }

  @Post('generate-token')
  async generateToken(@Body() generateTokenDto: GenerateTokenDto) {
    return this.authService.handleGenerateToken(generateTokenDto);
  }

  @Post('verify-token')
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    return this.authService.handleVerifyToken(verifyTokenDto);
  }
}
