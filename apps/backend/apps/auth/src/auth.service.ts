import {
  ChangePasswordDto,
  DeviceDetailsDto,
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
import { SendSmsDto } from '@app/common/dtos/sms';
import {
  CreateUserProfileDto,
  CreateUserSessionDto,
  UpdateUserSessionDto,
} from '@app/common/dtos/users';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import {
  CloudfareProvider,
  InfisicalProvider,
  KeycloakProvider,
  TwoFactorAuthProvider,
} from '@app/common/providers';
import {
  AuthMethod,
  DEFAULT_TTL_OTP_EXPIRED,
  EmailTemplateNameEnum,
  GetInfoAuthorizationCode,
  JwtResetPasswordPayload,
  REFRESH_TOKEN_LIFE,
  SignInResponse,
  TokensReponse,
  TwoFaToken,
  UserGoogleKeycloakData,
  Verify2FaActions,
  VerifyOtpActions,
  VerifyOwnershipOtpMethodEnum,
  generateOtp,
  generateSmsOTPMessage,
  hashPassword,
  isValidPassword,
  isValidUUID,
  verifyPassword,
} from '@app/common/utils';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import {
  OAuthProviderEnum,
  RoleEnum,
  SessionStatusEnum,
  UserDevicesType,
  UserSesstionsType,
  UsersType,
} from '@repo/db';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private clientId: string;
  private avatarUrl: string;
  private coverPhotoUrl: string;

  constructor(
    @Inject('REDIS_SERVICE')
    private readonly redisClient: ClientKafka,
    @Inject('EMAILS_SERVICE')
    private readonly emailsClient: ClientKafka,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientKafka,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly keyCloakProvider: KeycloakProvider,
    @Inject('SMS_SERVICE') private readonly smsClient: ClientKafka,
    private readonly twoFactorAuthProvider: TwoFactorAuthProvider,
    private readonly infisicalProvider: InfisicalProvider,
    private readonly cloudfareProvider: CloudfareProvider,
  ) {
    this.clientId = configService.get<string>('keycloak.client_id', '');
    this.avatarUrl = configService.get<string>('default_avatar_url', '');
    this.coverPhotoUrl = configService.get<string>('default_cover_photo', '');
  }

  onModuleInit() {
    const patterns = ['get-key'];

    const usersPattern = [
      'verify-password',
      'get-user-device',
      'get-user-session',
      'get-me',
      'update-profile',
      'get-user-by-field',
    ];

    patterns.forEach((pattern) => {
      this.redisClient.subscribeToResponseOf(pattern);
    });

    usersPattern.forEach((pattern) => {
      this.usersClient.subscribeToResponseOf(pattern);
    });
  }

  public signIn = async (signInDto: SignInDto) => {
    const { email, fingerprint, password } = signInDto;

    const existingUser = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
        oauth_account: true,
      },
    });

    if (!existingUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    if (existingUser.oauth_account?.provider !== OAuthProviderEnum.local)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `This email is registered using a different sign-in method and cannot be used for standard login.`,
      });

    if (
      existingUser?.password &&
      !isValidPassword(password, existingUser.password)
    )
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `The password you entered is incorrect. Please try again.`,
      });

    if (!existingUser.is_email_verified && existingUser.profile) {
      const { first_name, last_name } = existingUser.profile;

      this.processVerifyEmail(
        email,
        first_name,
        last_name,
        EmailTemplateNameEnum.EMAIL_OTP_VERIFICATION,
      );

      return {
        is_verified: false,
        message: `We've sent you a verification code. Please check your email inbox.`,
      };
    }

    const findDevice = await this.prismaService.userDevices.findFirst({
      where: {
        finger_print: fingerprint,
      },
    });

    if (!findDevice) {
      let token: string | null = null;

      const method = existingUser?.two_factor_enabled ? '2fa' : 'email';

      if (method == 'email' && existingUser?.email && existingUser?.profile) {
        this.processVerifyEmail(
          email,
          existingUser?.profile?.first_name,
          existingUser?.profile?.last_name,
          EmailTemplateNameEnum.EMAIL_VERIFY_DEVICE,
        );
      } else if (existingUser?.two_factor_enabled) {
        const payload: TwoFaToken = {
          sub: existingUser.id,
          type: '2fa',
        };

        token = this.jwtService.sign(payload, {
          expiresIn: '5m',
        });
      }

      return {
        is_verified: false,
        verification_method: method,
        message:
          method === '2fa'
            ? `We've detected a new device. Please open your authenticator app and enter the 2FA code to verify.`
            : `A one-time code has been sent to your email. Please enter it below to verify this device.`,
        ...(token && token?.trim() !== '' && { '2faToken': token }),
      };
    }

    if (existingUser.two_factor_enabled) {
      const payload: TwoFaToken = {
        sub: existingUser.id,
        type: '2fa',
      };

      const token = this.jwtService.sign(payload, {
        expiresIn: '5m',
      });

      return {
        requires2FA: true,
        message: 'Two-factor authentication required',
        '2faToken': token,
      };
    }

    if (existingUser.profile) {
      return this.createSessionAndIssueTokens(
        email,
        password,
        fingerprint,
        findDevice,
        existingUser.id,
        existingUser.profile.username,
      );
    }
  };

  public signUp = async (signUpDto: SignUpDto, userIp?: string) => {
    const {
      email,
      password,
      finger_print,
      deviceDetailsDto,
      captchaToken,
      ...res
    } = signUpDto;

    const isValid = await this.cloudfareProvider.verifyToken(
      captchaToken,
      userIp,
    );

    if (!isValid)
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message:
          'Verification failed. Please try again to prove you are not a bot.',
      });

    const existingUser = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });

    if (existingUser)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Your email has already been registered.`,
      });

    const existingPhoneNumber =
      await this.prismaService.userProfiles.findUnique({
        where: {
          phone_number: res.phone_number,
        },
      });

    if (existingPhoneNumber)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Your phone number has already been registered.`,
      });

    const newUser = await this.prismaService.users.create({
      data: {
        email,
        password: hashPassword(password),
        role: RoleEnum.user,
      },
    });

    await this.createNewUserProfile(
      res,
      this.avatarUrl,
      this.coverPhotoUrl,
      newUser.id,
    );

    await this.createNewUserDevice(finger_print, deviceDetailsDto, newUser.id);

    await this.createNewOAuthAcccount(OAuthProviderEnum.local, newUser.id);

    this.processVerifyEmail(
      email,
      signUpDto.first_name,
      signUpDto.last_name,
      EmailTemplateNameEnum.EMAIL_OTP_VERIFICATION,
    );

    await this.keyCloakProvider.signUpByKeycloak({
      username: email,
      email,
      password,
      firstName: res.first_name,
      lastName: res.last_name,
    });

    return {
      success: true,
      message: 'Please check your email and enter the OTP.',
    };
  };

  public verifyOtp = async (verifyOtpDto: VerifyOtpDto) => {
    const { email, otp, action } = verifyOtpDto;

    const existingEmail = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });

    if (!existingEmail)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const key = `${email}:otp-verify`;

    const cachedOtp = await firstValueFrom(
      this.redisClient.send('get-key', key),
    );

    if (!cachedOtp)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Your OTP has expired. Please request a new one.`,
      });

    if (typeof cachedOtp === 'string' && cachedOtp !== otp)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid OTP. Please try again.`,
      });

    await this.prismaService.users.update({
      where: {
        email,
      },
      data: {
        is_email_verified: true,
      },
    });

    const user = await this.keyCloakProvider.getUserByEmailKeycloak(email);

    if (user) await this.keyCloakProvider.verifyUserEmailKeycloak(user.id);

    const authorization_code = this.jwtService.sign(
      { email },
      {
        expiresIn: '5m',
      },
    );

    return {
      is_verified: true,
      ...(action === VerifyOtpActions.SIGN_UP && { authorization_code }),
      message: 'Your email has been verified successfully.',
    };
  };

  public forgotPassword = async (forgotPasswordDto: ForgotPasswordDto) => {
    const { email } = forgotPasswordDto;

    const existingEmail = await this.prismaService.users.findUnique({
      where: {
        email,
      },
      include: {
        oauth_account: true,
        profile: true,
      },
    });

    if (!existingEmail)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    if (existingEmail.oauth_account?.provider !== OAuthProviderEnum.local)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `This is not a local account, therefore password recovery via OTP is not available.`,
      });

    const authorizationCode = this.jwtService.sign(
      { email },
      {
        expiresIn: '30m',
      },
    );

    const resetPasswordLink = `${this.configService.get<string>('frontend_url', '')}/auth/reset-password/?authorization_code=${authorizationCode}`;

    this.emailsClient.emit('send-email', {
      email,
      templateName: EmailTemplateNameEnum.EMAIL_RESET_PASSWORD,
      context: {
        reset_link: resetPasswordLink,
        full_name:
          existingEmail.profile?.first_name +
          ' ' +
          existingEmail.profile?.last_name,
      },
    });

    return {
      success: true,
      message: `A reset password link has been sent to your email.`,
    };
  };

  public resetPassword = async (resetPasswordDto: ResetPasswordDto) => {
    const { newPassword, authorizationCode } = resetPasswordDto;

    try {
      const { email } =
        this.jwtService.verify<JwtResetPasswordPayload>(authorizationCode);

      const existingEmail = await this.prismaService.users.findUnique({
        where: {
          email,
        },
        include: {
          oauth_account: true,
        },
      });

      if (!existingEmail)
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `This email has not been registered.`,
        });

      if (existingEmail.oauth_account?.provider !== OAuthProviderEnum.local)
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Password recovery is not available for non-local accounts.`,
        });

      this.usersClient.emit(
        'update-password',
        JSON.stringify({
          email,
          password: newPassword,
        }),
      );

      await this.keyCloakProvider.updatePasswordUserKeyCloak(
        newPassword,
        email,
      );

      return {
        sucess: true,
        message:
          'Congratulations! Your password has been successfully updated.',
      };
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'The authorization code you provided has expired.',
        });
      } else {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'The authorization code you provided is invalid.',
        });
      }
    }
  };

  public oAuthCallback = async (
    oAuthCallbackDto: OAuthCallbackDto,
  ): Promise<SignInResponse> => {
    try {
      const {
        access_token,
        phone_number,
        deviceDetailsDto,
        finger_print,
        gender,
        dob,
        address,
        first_name,
        last_name,
        refresh_token,
        otp,
        username,
      } = oAuthCallbackDto;

      const { email, sub } =
        await this.keyCloakProvider.verifyToken(access_token);

      const { identity_provider } =
        await this.keyCloakProvider.verifyToken(access_token);

      if (!identity_provider)
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message:
            'Requested identity provider could not be found. Please verify your request.',
        });

      const existingPhoneNumber =
        await this.prismaService.userProfiles.findUnique({
          where: {
            phone_number,
          },
        });

      if (existingPhoneNumber)
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `This phone number has already been registered.`,
        });

      const newUser = await this.prismaService.users.upsert({
        where: {
          email,
        },
        update: {
          role: RoleEnum.user,
        },
        create: {
          email,
          is_email_verified: identity_provider === 'google' ? true : false,
          role: RoleEnum.user,
        },
      });

      if (otp) {
        await this.verifyOtp({
          otp,
          email,
          action: VerifyOtpActions.SIGN_UP,
        });
      }

      await this.createNewUserProfile(
        {
          phone_number,
          first_name,
          last_name,
          gender,
          dob,
          address,
          username,
        },
        this.avatarUrl,
        this.coverPhotoUrl,
        newUser.id,
      );

      await this.createNewOAuthAcccount(
        identity_provider === 'google'
          ? OAuthProviderEnum.google
          : OAuthProviderEnum.facebook,
        newUser.id,
        sub,
      );

      await this.createNewUserDevice(
        finger_print,
        deviceDetailsDto,
        newUser.id,
        true,
      );

      const userKeycloak =
        await this.keyCloakProvider.getUserByEmailKeycloak(email);

      if (userKeycloak)
        await this.keyCloakProvider.verifyUserEmailKeycloak(userKeycloak.id);

      await this.keyCloakProvider.assignRoleKeycloak('user', userKeycloak.id);

      const payload: any =
        await this.keyCloakProvider.verifyToken(access_token);

      const clientRoles =
        payload?.resource_access?.[this.clientId]?.roles || [];

      return {
        access_token,
        refresh_token,
        role: clientRoles,
      };
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.response?.data || error?.message,
      });
    }
  };

  public getInfoOAuthCallback = async (
    getInfoOAuthCallbackDto: GetInfoOAuthCallbackDto,
  ) => {
    try {
      const { iss, code, authMethod } = getInfoOAuthCallbackDto;

      return this.generateGetInfoAuthorizationCodeKeycloak(
        iss,
        code,
        authMethod,
      );
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.response?.data || error?.message,
      });
    }
  };

  private createNewOAuthAcccount = async (
    provider: OAuthProviderEnum,
    userId: string,
    providerId?: string,
  ) => {
    if (providerId) {
      await this.prismaService.oAuthAccounts.upsert({
        where: { provider_id: providerId },
        update: {
          provider,
          user: {
            connect: {
              id: userId,
            },
          },
        },
        create: {
          provider,
          provider_id: providerId,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } else {
      await this.prismaService.oAuthAccounts.create({
        data: {
          provider,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }
  };

  private createNewUserProfile = async (
    createUserProfileDto: CreateUserProfileDto,
    avatar_url: string,
    cover_photo_url: string,
    userId: string,
  ) => {
    await this.prismaService.userProfiles.upsert({
      where: {
        user_id: userId,
      },
      update: {
        ...createUserProfileDto,
        avatar_url,
        cover_photo_url,
      },
      create: {
        ...createUserProfileDto,
        avatar_url,
        cover_photo_url,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  };

  private createNewUserDevice = async (
    finger_print: string,
    deviceDetailsDto: DeviceDetailsDto,
    userId: string,
    is_trusted?: boolean,
  ) => {
    await this.prismaService.userDevices.upsert({
      where: {
        finger_print_user_id: {
          finger_print: finger_print,
          user_id: userId,
        },
      },
      update: {
        ...deviceDetailsDto,
        ...(is_trusted ? { is_trusted } : {}),
        user: {
          connect: {
            id: userId,
          },
        },
      },
      create: {
        finger_print,
        ...deviceDetailsDto,
        user: {
          connect: {
            id: userId,
          },
        },
        ...(is_trusted ? { is_trusted } : {}),
      },
    });
  };

  private generateGetInfoAuthorizationCodeKeycloak = async (
    iss: string,
    code: string,
    authMethod: AuthMethod,
  ): Promise<TokensReponse | GetInfoAuthorizationCode> => {
    const tokenUrl = `${iss}/protocol/openid-connect/token`;

    const payload = new URLSearchParams();

    payload.append('grant_type', 'authorization_code');

    payload.append('code', code);

    payload.append(
      'redirect_uri',
      this.configService.get<string>('keycloak.redirect_uri', ''),
    );

    payload.append(
      'client_id',
      this.configService.get<string>('keycloak.client_id', ''),
    );

    payload.append(
      'client_secret',
      this.configService.get<string>('keycloak.secret', ''),
    );

    const tokenResponse = await firstValueFrom(
      this.httpService.post(tokenUrl, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    );

    const { access_token, refresh_token } = tokenResponse.data;

    const { identity_provider, email, given_name, family_name } =
      await this.keyCloakProvider.verifyToken(access_token);

    if (identity_provider === 'facebook' && email && given_name && family_name)
      this.processVerifyEmail(
        email,
        family_name,
        given_name,
        EmailTemplateNameEnum.EMAIL_OTP_VERIFICATION,
      );

    const userInfoUrl = `${iss}/protocol/openid-connect/userinfo`;

    const userInfoResponse = await firstValueFrom(
      this.httpService.get(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }),
    );

    const user: UserGoogleKeycloakData = userInfoResponse.data;

    const existingEmail = await this.prismaService.users.findUnique({
      where: {
        email: user.email,
      },
    });

    if (authMethod === AuthMethod.SIGN_IN) {
      if (
        !existingEmail ||
        (existingEmail && !existingEmail.is_email_verified)
      ) {
        await this.keyCloakProvider.logOutUserSessions(user.email);

        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `This email has not been registered.`,
        });
      }

      return {
        access_token,
        refresh_token,
        role: await this.keyCloakProvider.getRolesKeycloak(access_token),
        provider: identity_provider,
      };
    }

    if (existingEmail && existingEmail.is_email_verified) {
      await this.keyCloakProvider.logOutUserSessions(user.email);

      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `This email has already been registered.`,
      });
    }

    return {
      given_name: user.given_name,
      family_name: user.family_name,
      access_token,
      refresh_token,
      provider: identity_provider,
    };
  };

  private processVerifyEmail = (
    email: string,
    firstName: string,
    lastName: string,
    templateName: EmailTemplateNameEnum,
  ) => {
    const otp = generateOtp();

    this.redisClient.emit(
      'set-key',
      JSON.stringify({
        key: `${email}:otp-verify`,
        data: otp,
        ttl: DEFAULT_TTL_OTP_EXPIRED,
      }),
    );

    this.emailsClient.emit('send-email', {
      email,
      templateName,
      context: {
        otp,
        full_name: firstName + ' ' + lastName,
      },
    });
  };

  public generateToken = async (generateTokenDto: GenerateTokenDto) => {
    const { payload } = generateTokenDto;

    const token = await this.jwtService.signAsync(
      { payload },
      {
        expiresIn: this.configService.get<string>(
          'jwt.access_token_life',
          '120s',
        ),
      },
    );

    return { token };
  };

  public verifyToken = async (verifyTokenDto: VerifyTokenDto) => {
    const { token } = verifyTokenDto;

    if (!token)
      return {
        success: false,
      };

    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (!payload || !payload.payload || !isValidUUID(payload.payload))
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid token.',
        });

      return {
        success: true,
      };
    } catch (error) {
      console.error(error);

      throw error;
    }
  };

  public refreshToken = async (refreshToken: string, fingerPrint: string) => {
    const { access_token, refresh_token } =
      await this.keyCloakProvider.refreshToken(refreshToken);

    const { email } = await this.keyCloakProvider.verifyToken(access_token);

    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    const userSession = await firstValueFrom<UserSesstionsType>(
      this.usersClient.send('get-user-session', {
        user_id: user.id,
        finger_print: fingerPrint,
      }),
    );

    const isMatch = verifyPassword(refreshToken, userSession.refresh_token);

    if (
      !isMatch ||
      new Date().getTime() > new Date(userSession.expires_at).getTime()
    )
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message:
          'Looks like your session has expired. Please log in again to keep going.',
      });

    const userDevice = await firstValueFrom<UserDevicesType>(
      this.usersClient.send('get-user-device', {
        user_id: user.id,
        finger_print: fingerPrint,
      }),
    );

    const createUserSessionDto: CreateUserSessionDto = {
      refresh_token: hashPassword(refresh_token),
      finger_print: fingerPrint,
      device_name: userDevice.device_name,
      user_agent: userDevice.user_agent,
      ip_address: userDevice.ip_address,
      user_id: user.id,
      expires_at: new Date(new Date().getTime() + REFRESH_TOKEN_LIFE),
    };

    this.usersClient.emit(
      'create-user-session',
      JSON.stringify(createUserSessionDto),
    );

    return this.keyCloakProvider.refreshToken(refreshToken);
  };

  public changePassword = async (
    changePasswordDto: ChangePasswordDto,
    email: string,
    finger_print: string,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const { currentPassword, newPassword } = changePasswordDto;

    const isValidPassword = await firstValueFrom<string>(
      this.usersClient.send('verify-password', { currentPassword, email }),
    );

    if (isValidPassword === 'false')
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `The current password you entered is not correct. Please verify and try again.`,
      });

    this.usersClient.emit(
      'update-password',
      JSON.stringify({
        email,
        password: newPassword,
      }),
    );

    this.usersClient.emit(
      'deactive-other-sessions',
      JSON.stringify({
        user_id: user.id,
        exclude_fingerprint: finger_print,
      }),
    );

    await this.keyCloakProvider.updatePasswordUserKeyCloak(newPassword, email);

    const data = await this.keyCloakProvider.signInByKeycloak(
      email,
      newPassword,
    );

    return {
      access_token: data?.access_token,
      refresh_token: data?.refresh_token,
      role: await this.keyCloakProvider.getRolesKeycloak(data.access_token),
    };
  };

  public signOut = async (signOutDto: SignOutDto) => {
    const { access_token, refresh_token, finger_print, user_id } = signOutDto;

    const updateUserSessionDto: UpdateUserSessionDto = {
      user_id,
      finger_print,
      status: SessionStatusEnum.inactive,
    };

    if (refresh_token?.trim())
      await this.keyCloakProvider.revokeToken(refresh_token, 'refresh_token');

    if (access_token?.trim()) {
      try {
        await this.keyCloakProvider.verifyToken(access_token);
      } catch (error) {
        console.error(error);

        this.usersClient.emit(
          'update-user-session',
          JSON.stringify(updateUserSessionDto),
        );

        if (!refresh_token?.trim())
          throw new RpcException({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: `Your session has expired. Please log in again.`,
          });
      }
    }

    this.usersClient.emit(
      'update-user-session',
      JSON.stringify(updateUserSessionDto),
    );

    return {
      message: 'Signed out successfully.',
      logged_in: false,
    };
  };

  public sendOtp = async (sendOtpDto: SendOtpDto) => {
    const { method, email, phone_number, type } = sendOtpDto;

    if (method === 'email' && email === '')
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Please provide an email address to receive the OTP.`,
      });

    if (method === 'sms' && phone_number === '')
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Please provide a phone number to receive the OTP via SMS.`,
      });

    if (method && email === '' && phone_number === '')
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Missing contact information. Please provide either an email or phone number.`,
      });

    const payload = {
      field: 'email',
      value: email,
      getUserQueryDto: {
        includeProfile: true,
      },
    };

    const user = await firstValueFrom(
      this.usersClient.send('get-user-by-field', JSON.stringify(payload)),
    );

    const otp = generateOtp();

    if (method === 'sms' && phone_number) {
      this.redisClient.emit(
        'set-key',
        JSON.stringify({
          key: `otp:verify-sms:sms:${phone_number}`,
          data: otp,
          ttl: DEFAULT_TTL_OTP_EXPIRED,
        }),
      );

      const sendSmsDto: SendSmsDto = {
        from: this.configService.get<string>('twilio.phone_number', ''),
        to: phone_number,
        message: generateSmsOTPMessage(
          user.profile.first_name + ' ' + user.profile.last_name,
          otp,
          type,
        ),
      };

      this.smsClient.emit('send-sms', JSON.stringify(sendSmsDto));

      return {
        success: true,
        message:
          type === 'update'
            ? 'We have sent a verification code to your new phone number.'
            : 'We have sent a verification code to your phone number to verify your identity.',
      };
    } else if (method === 'email' && email) {
      this.redisClient.emit(
        'set-key',
        JSON.stringify({
          key: `otp:verify-email:email:${email}`,
          data: otp,
          ttl: DEFAULT_TTL_OTP_EXPIRED,
        }),
      );

      this.emailsClient.emit('send-email', {
        email,
        templateName: EmailTemplateNameEnum.EMAIL_IDENTITY_VERIFICATION,
        context: {
          otp,
          full_name: user?.profile?.first_name + ' ' + user?.profile?.last_name,
        },
      });

      return {
        success: true,
        message:
          type === 'update'
            ? 'We have sent a verification code to your email.'
            : 'We have sent a verification code to your email to verify your identity.',
      };
    }
  };

  public verifyOwnershipOtp = async (
    verifyOwnershipOtpDto: VerifyOwnershipOtpDto,
  ) => {
    const { method, otp, email, phone_number } = verifyOwnershipOtpDto;

    const isSms = method === VerifyOwnershipOtpMethodEnum.SMS;

    const isEmail = method === VerifyOwnershipOtpMethodEnum.EMAIL;

    if (isSms || isEmail) {
      const identifier = isSms ? phone_number : email;

      const type = isSms ? 'sms' : 'email';

      const key = `otp:verify-${type}:${type}:${identifier}`;

      const cachedOtp = await firstValueFrom(
        this.redisClient.send('get-key', key),
      );

      if (!cachedOtp) {
        throw new RpcException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message:
            'The OTP you received has expired. Please request a new one.',
        });
      }

      if (otp !== cachedOtp) {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'The OTP you entered is incorrect. Please try again.',
        });
      }
    }

    return {
      success: true,
      message: 'Your OTP has been successfully verified.',
    };
  };

  public generate2Fa = async (email: string) => {
    const { otpAuthUrl } =
      await this.twoFactorAuthProvider.generate2FASecret(email);

    const qrCodeDataUrl =
      await this.twoFactorAuthProvider.generate2FAQrCode(otpAuthUrl);

    return {
      otpAuthUrl,
      qrCodeDataUrl,
    };
  };

  public verify2Fa = async (
    verify2FaDto: Verify2FaDto,
    fingerprint: string,
  ) => {
    const { otp, action, token, password, email } = verify2FaDto;

    if (
      token?.trim() === '' &&
      password?.trim() === '' &&
      action === Verify2FaActions.SIGN_IN
    )
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          'Please provide the verification token and password to continue signing in.',
      });

    const secret = await this.infisicalProvider.getSecret(
      `TOTP_SECRET_${email}`,
    );

    if (!secret)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `We couldn't find your 2FA setup. Please try setting it up again.`,
      });

    const isValid = this.twoFactorAuthProvider.verify2FAOtp(otp, secret);

    if (!isValid)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `The verification code you entered is invalid. Please try again.`,
      });

    if (
      action === Verify2FaActions.OTHER ||
      action === Verify2FaActions.VERIFY_DEVICE
    ) {
      return {
        is_verified: true,
        message: 'Two-step verification completed. You can now continue.',
      };
    }

    if (
      action === Verify2FaActions.ENABLE_2FA ||
      action === Verify2FaActions.DISABLE_2FA
    ) {
      this.usersClient.emit(
        'update-status-2fa',
        JSON.stringify({
          email,
          action,
        }),
      );

      return {
        success: true,
        message:
          action === Verify2FaActions.ENABLE_2FA
            ? 'Two-factor authentication has been enabled successfully.'
            : 'Two-factor authentication has been disabled successfully.',
        is2FAEnabled: action === Verify2FaActions.ENABLE_2FA ? true : false,
      };
    }

    if (!token)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `2FA token is required for 2fa sign in.`,
      });

    try {
      const { sub } = this.jwtService.verify<TwoFaToken>(token);

      const user = await firstValueFrom<any>(
        this.usersClient.send(
          'get-user-by-field',
          JSON.stringify({
            field: 'id',
            value: sub,
            getUserQueryDto: {
              includeProfile: true,
            },
          }),
        ),
      );

      if (
        !user.password ||
        user.password.trim() === '' ||
        !password ||
        password.trim() === ''
      )
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `This account was created using a social login. Please use that option to sign in.`,
        });

      const device = await firstValueFrom<UserDevicesType>(
        this.usersClient.send('get-user-device', {
          user_id: sub,
          finger_print: fingerprint,
        }),
      );

      return this.createSessionAndIssueTokens(
        email,
        password,
        fingerprint,
        device,
        sub,
        user.profile.username,
      );
    } catch (error) {
      console.error(error);

      if (error.name === 'TokenExpiredError') {
        throw new RpcException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Your verification token has expired. Please sign in again.',
        });
      }

      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message:
          'The verification code is invalid or has expired. Please sign in again.',
      });
    }
  };

  private createSessionAndIssueTokens = async (
    email: string,
    password: string,
    fingerprint: string,
    device: UserDevicesType,
    user_id: string,
    username: string,
  ) => {
    const data = await this.keyCloakProvider.signInByKeycloak(email, password);

    const createUserSessionDto: CreateUserSessionDto = {
      refresh_token: hashPassword(data.refresh_token),
      finger_print: fingerprint,
      device_name: device.device_name,
      user_agent: device.user_agent,
      ip_address: device.ip_address,
      user_id,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_LIFE),
    };

    this.usersClient.emit(
      'create-user-session',
      JSON.stringify(createUserSessionDto),
    );

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      role: await this.keyCloakProvider.getRolesKeycloak(data.access_token),
      username,
    };
  };

  public createTrustDevice = async (
    finger_print: string,
    trustDeviceDto: TrustDeviceDto,
  ) => {
    const { email, ...res } = trustDeviceDto;

    const payload = {
      field: 'email',
      value: email,
    };

    const user = await firstValueFrom<UsersType>(
      this.usersClient.send('get-user-by-field', JSON.stringify(payload)),
    );

    return this.createNewUserDevice(finger_print, res, user.id, true);
  };
}
