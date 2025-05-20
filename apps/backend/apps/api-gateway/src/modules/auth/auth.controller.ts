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
  Verify2FaDto,
  VerifyOtpDto,
  VerifyOwnershipOtpDto,
  VerifyTokenDto,
} from '@app/common/dtos/auth';
import { clearCookies, initializeCookies } from '@app/common/utils';
import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { RoleEnum } from '@repo/db';
import { Request, Response } from 'express';
import { KeycloakUser, Public, Roles } from 'nest-keycloak-connect';
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
  async signUp(@Body() signUpDto: SignUpDto, @Req() req: Request) {
    const userIp = req.ip;

    return this.authService.signUp(signUpDto, userIp);
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
  async refreshToken(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, any>,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken)
      throw new HttpException(
        'Refresh token expired or missing',
        HttpStatus.UNAUTHORIZED,
      );

    const finger_print = headers['x-fingerprint'];

    if (!finger_print)
      throw new HttpException(
        `We couldn't verify your device. Please try again.`,
        HttpStatus.UNAUTHORIZED,
      );

    const { access_token, refresh_token, role } =
      await this.authService.refreshToken(refreshToken, finger_print);

    initializeCookies(res, { access_token, refresh_token, role });

    return res.status(HttpStatus.CREATED).json({ access_token, refreshToken });
  }

  @Post('change-password')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @KeycloakUser() user: any,
    @Res() response: Response,
    @Headers() headers: Record<string, any>,
  ) {
    const finger_print = headers['x-fingerprint'];

    if (!finger_print)
      throw new HttpException(
        `We couldn't verify your device. Please try again.`,
        HttpStatus.UNAUTHORIZED,
      );

    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    const { access_token, refresh_token, role } =
      await this.authService.changePassword(
        changePasswordDto,
        email,
        finger_print,
      );

    initializeCookies(response, { access_token, refresh_token, role });

    return response
      .status(HttpStatus.CREATED)
      .json({ success: true, message: `Password changed successfully.` });
  }

  @Post('sign-out')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async signOut(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, any>,
  ) {
    const access_token = req.cookies['access_token'] as string;

    const refresh_token = req.cookies['refresh_token'] as string;

    const fingerprint = headers['x-fingerprint'] as string;

    const isLoggedIn = req.cookies['logged_in'];

    if (
      !(access_token && refresh_token && fingerprint) ||
      isLoggedIn !== 'true'
    ) {
      throw new HttpException(
        'Your session has expired or been removed. Please sign in again.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const signOutDto: SignOutDto = {
      access_token,
      refresh_token,
      finger_print: fingerprint,
    };

    const data = await this.authService.signOut(signOutDto);

    if (data) clearCookies(res);

    clearCookies(res);

    return res.status(HttpStatus.CREATED).json(data);
  }

  @Post('send-otp')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async sendOtp(@Body() sendOtpDto: SendOtpDto, @KeycloakUser() user: any) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.authService.sendOtp({
      ...sendOtpDto,
      email,
    });
  }

  @Post('account/verify-ownership')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async verifyAccountOwnership(
    @Body() verifyOwnershipOtpDto: VerifyOwnershipOtpDto,
  ) {
    return this.authService.verifyAccountOwnership(verifyOwnershipOtpDto);
  }

  @Post('2fa/generate')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async generate2FA(@KeycloakUser() user: any) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.authService.generate2FA(email);
  }

  @Post('2fa/verify')
  @Public()
  async verify2FA(
    @Body() verify2FaDto: Verify2FaDto,
    @Headers() headers: Record<string, any>,
    @Res() response: Response,
  ) {
    const finger_print = headers['x-fingerprint'];

    if (!finger_print)
      throw new HttpException(
        `We couldn't verify your device. Please try again.`,
        HttpStatus.UNAUTHORIZED,
      );

    const data = await this.authService.verify2FA(verify2FaDto, finger_print);

    if (data?.access_token && data?.refresh_token && data?.role) {
      const { access_token, refresh_token, role } = data;

      initializeCookies(response, {
        access_token,
        refresh_token,
        role,
      });
    }

    return response.status(HttpStatus.CREATED).json(data);
  }
}
