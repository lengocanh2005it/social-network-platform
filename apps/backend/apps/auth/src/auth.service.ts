import {
  DeviceDetailsDto,
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
import { CreateUserProfileDto } from '@app/common/dtos/users';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { KeycloakProvider } from '@app/common/providers';
import {
  AuthMethod,
  DEFAULT_TTL_OTP_EXPIRED,
  EmailTemplateNameEnum,
  GetInfoAuthorizationCode,
  JwtResetPasswordPayload,
  KeycloakSignUpData,
  SignInResponse,
  TokensReponse,
  UserGoogleKeycloakData,
  generateOtp,
  hashPassword,
  isValidPassword,
  isValidUUID,
} from '@app/common/utils';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { OAuthProviderEnum, RoleEnum } from '@repo/db';
import { omit } from 'lodash';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private keycloakAuthServerUrl: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;
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
    private jwtService: JwtService,
    private readonly keyCloakProvider: KeycloakProvider,
  ) {
    this.keycloakAuthServerUrl = configService.get<string>(
      'keycloak.auth_server_url',
      '',
    );
    this.realm = configService.get<string>('keycloak.realm', '');
    this.clientId = configService.get<string>('keycloak.client_id', '');
    this.clientSecret = configService.get<string>('keycloak.secret', '');
    this.avatarUrl = configService.get<string>('default_avatar_url', '');
    this.coverPhotoUrl = configService.get<string>('default_cover_photo', '');
  }

  onModuleInit() {
    const patterns = ['get-key'];

    patterns.forEach((pattern) => {
      this.redisClient.subscribeToResponseOf(pattern);
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

      this.processVerifyEmail(email, first_name, last_name);

      return {
        success: true,
        message: 'Open email and enter OTP now.',
      };
    }

    const findDevice = await this.prismaService.userDevices.findFirst({
      where: {
        finger_print: fingerprint,
      },
    });

    if (!findDevice) {
      return;
    }

    await this.prismaService.userDevices.update({
      where: {
        user_id: existingUser.id,
      },
      data: {
        is_trusted: true,
      },
    });

    if (existingUser.two_factor_enabled) {
      return;
    }

    const data = await this.signInByKeycloak(email, password);

    return {
      access_token: data?.access_token,
      refresh_token: data?.refresh_token,
      role: await this.getRolesKeycloak(data.access_token),
    };
  };

  public signUp = async (signUpDto: SignUpDto) => {
    const { email, password, finger_print, deviceDetailsDto, ...res } =
      signUpDto;

    const existingUser = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });

    if (existingUser && existingUser.is_email_verified)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `The email '${email}' has already been registered.`,
      });

    const existingPhoneNumber =
      await this.prismaService.userProfiles.findUnique({
        where: {
          phone_number: res.phone_number,
        },
      });

    if (existingPhoneNumber && existingUser?.is_email_verified)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `The phone number '${res.phone_number}' has already been registered.`,
      });

    if (existingUser && !existingUser.is_email_verified) {
      this.processVerifyEmail(email, signUpDto.first_name, signUpDto.last_name);

      return {
        success: true,
        message: 'Please check your email and enter the OTP.',
      };
    }

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

    this.processVerifyEmail(email, signUpDto.first_name, signUpDto.last_name);

    await this.signUpByKeycloak({
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
    const { email, otp } = verifyOtpDto;

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

    const user = await this.getUserByEmailKeycloak(email);

    if (user) {
      await this.verifyUserEmailKeycloak(user.id);
    }

    const authorization_code = this.jwtService.sign(
      { email },
      {
        expiresIn: '5m',
      },
    );

    return {
      success: true,
      authorization_code,
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
          message: `This is a local account, therefore changing the password via password recovery is not available.`,
        });

      this.usersClient.emit(
        'update-password',
        JSON.stringify({
          email,
          password: newPassword,
        }),
      );

      await this.updatePasswordUserKeyCloak(newPassword, email);

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

      const userKeycloak = await this.getUserByEmailKeycloak(email);

      if (userKeycloak) await this.verifyUserEmailKeycloak(userKeycloak.id);

      await this.assignRoleKeycloak('user', userKeycloak.id);

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
      this.processVerifyEmail(email, family_name, given_name);

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
        await this.logOutUserSessions(user.email);

        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `This email has not been registered.`,
        });
      }

      return {
        access_token,
        refresh_token,
        role: await this.getRolesKeycloak(access_token),
        provider: identity_provider,
      };
    }

    if (existingEmail && existingEmail.is_email_verified) {
      await this.logOutUserSessions(user.email);

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
      templateName: EmailTemplateNameEnum.EMAIL_OTP_VERIFICATION,
      context: {
        otp,
        full_name: firstName + ' ' + lastName,
      },
    });
  };

  private signInByKeycloak = async (email: string, password: string) => {
    try {
      const keycloakUrl = `${this.keycloakAuthServerUrl}/realms/${this.realm}/protocol/openid-connect/token`;

      const data = new URLSearchParams();

      data.append('grant_type', 'password');

      data.append('client_id', this.clientId);

      data.append('client_secret', this.clientSecret);

      data.append('username', email);

      data.append('password', password);

      const response = await firstValueFrom(
        this.httpService.post(keycloakUrl, data),
      );

      return response.data;
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.response?.data || error?.message,
      });
    }
  };

  private signUpByKeycloak = async (keycloakSignUpData: KeycloakSignUpData) => {
    try {
      const { email, password } = keycloakSignUpData;

      const baseUrl = `${this.keycloakAuthServerUrl}/admin/realms/${this.realm}/users`;

      const data = {
        ...omit(keycloakSignUpData, ['password']),
        enabled: true,
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: false,
          },
        ],
      };

      const response = await firstValueFrom(
        this.httpService.post(baseUrl, data, {
          headers: {
            Authorization: `Bearer ${await this.getAdminToken()}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      if (response.status !== 201)
        throw new RpcException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Have an error when creating user`,
        });

      const users = await firstValueFrom(
        this.httpService.get(`${baseUrl}?username=${email}`, {
          headers: {
            Authorization: `Bearer ${await this.getAdminToken()}`,
          },
        }),
      );

      const userId = users.data[0]?.id;

      if (!userId)
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found.',
        });

      await this.assignRoleKeycloak('user', userId);
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.response?.data || error?.message,
      });
    }
  };

  private getAdminToken = async (): Promise<string> => {
    try {
      const baseUrl = `${this.keycloakAuthServerUrl}/realms/${this.realm}/protocol/openid-connect/token`;

      const data = new URLSearchParams();

      data.append('grant_type', 'client_credentials');

      data.append('client_id', this.clientId);

      data.append('client_secret', this.clientSecret);

      const response = await firstValueFrom(
        this.httpService.post(baseUrl, data),
      );

      return response.data.access_token;
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.response?.data || error?.message,
      });
    }
  };

  private getClientId = async (clientName: string): Promise<string> => {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.keycloakAuthServerUrl}/admin/realms/${this.realm}/clients`,
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
            },
          },
        ),
      );

      const client = response.data.find((c: any) => c.clientId === clientName);

      return client ? client.id : '';
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.response?.data || error?.message,
      });
    }
  };

  private getClientRoles = async (clientId: string): Promise<any[]> => {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.keycloakAuthServerUrl}/admin/realms/${this.realm}/clients/${clientId}/roles`,
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
  };

  private verifyUserEmailKeycloak = async (userId: string): Promise<void> => {
    const baseUrl = `${this.keycloakAuthServerUrl}/admin/realms/${this.realm}/users/${userId}`;

    try {
      await firstValueFrom(
        this.httpService.put(
          baseUrl,
          {
            emailVerified: true,
          },
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
  };

  private getUserByEmailKeycloak = async (email: string): Promise<any> => {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.keycloakAuthServerUrl}/admin/realms/${this.realm}/users?email=${encodeURIComponent(email)}`,
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
            },
          },
        ),
      );

      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
  };

  private updatePasswordUserKeyCloak = async (
    newPassword: string,
    email: string,
  ) => {
    const user = await this.getUserByEmailKeycloak(email);

    if (!user)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
      });

    try {
      await firstValueFrom(
        this.httpService.put(
          `${this.keycloakAuthServerUrl}/admin/realms/${this.realm}/users/${user.id}/reset-password`,
          {
            type: 'password',
            temporary: false,
            value: newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
  };

  private logOutUserSessions = async (email: string) => {
    try {
      const user = await this.getUserByEmailKeycloak(email);

      await firstValueFrom(
        this.httpService.post(
          `${this.keycloakAuthServerUrl}/admin/realms/${this.realm}/users/${user.id}/logout`,
          null,
          {
            headers: {
              Authorization: `Bearer ${await this.getAdminToken()}`,
            },
          },
        ),
      );
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
  };

  private assignRoleKeycloak = async (
    roleName: 'admin' | 'user',
    userId: string,
  ) => {
    const clientId = await this.getClientId(this.clientId);

    const roles = await this.getClientRoles(clientId);

    const userRole = roles.find((role) => role.name === roleName);

    if (!userRole)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Role ${roleName} not found.`,
      });

    await firstValueFrom(
      this.httpService.post(
        `${this.keycloakAuthServerUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/clients/${clientId}`,
        [userRole],
        {
          headers: {
            Authorization: `Bearer ${await this.getAdminToken()}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
  };

  private getRolesKeycloak = async (access_token: string): Promise<any> => {
    try {
      const payload: any =
        await this.keyCloakProvider.verifyToken(access_token);

      return payload?.resource_access?.[this.clientId]?.roles[0] || null;
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
      });
    }
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

  public refreshToken = async (refreshToken: string) => {
    return this.keyCloakProvider.refreshToken(refreshToken);
  };
}
