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
import { initializeCookies } from '@app/common/utils';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'nest-keycloak-connect';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const data = await this.authService.signIn(signInDto);

    if (data?.access_token && data?.refresh_token && data?.role) {
      const { access_token, refresh_token, role } = data;

      initializeCookies(res, { access_token, refresh_token, role });
    }

    return res.status(HttpStatus.CREATED).json(data);
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('oauth/callback')
  async oAuthCallback(
    @Body() oAuthCallbackDto: OAuthCallbackDto,
    @Res() res: Response,
  ) {
    const data = await this.authService.oAuthCallback(oAuthCallbackDto);

    if (data && data?.access_token && data?.refresh_token && data?.role) {
      const { access_token, refresh_token, role } = data;

      initializeCookies(res, { access_token, refresh_token, role });
    }

    return res.status(HttpStatus.CREATED).json(data);
  }

  @Public()
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

  @Public()
  @Post('generate-token')
  async generateToken(@Body() generateTokenDto: GenerateTokenDto) {
    return this.authService.handleGenerateToken(generateTokenDto);
  }

  @Public()
  @Post('verify-token')
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    return this.authService.handleVerifyToken(verifyTokenDto);
  }

  @Public()
  @Post('token/refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken)
      throw new HttpException(
        'Refresh token expired or missing',
        HttpStatus.UNAUTHORIZED,
      );

    const { access_token, refresh_token, role } =
      await this.authService.refreshToken(refreshToken);

    initializeCookies(res, { access_token, refresh_token, role });

    return res.status(HttpStatus.CREATED).json({ access_token, refreshToken });
  }
}
