import {
  DeviceDetailsDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyOtpDto,
} from '@app/common/dtos/auth';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import {
  DEFAULT_TTL_OTP_EXPIRED,
  EmailTemplateNameEnum,
  JwtResetPasswordPayload,
  KeycloakSignUpData,
  generateOtp,
  hashPassword,
  isValidPassword,
} from '@app/common/utils';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { OAuthProvider, Role } from '@prisma/client';
import { jwtDecode } from 'jwt-decode';
import { omit } from 'lodash';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private keycloakAuthServerUrl: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;

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
  ) {
    this.keycloakAuthServerUrl = configService.get<string>(
      'keycloak.auth_server_url',
      '',
    );
    this.realm = configService.get<string>('keycloak.realm', '');
    this.clientId = configService.get<string>('keycloak.client_id', '');
    this.clientSecret = configService.get<string>('keycloak.secret', '');
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
      },
    });

    if (!existingUser)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This email has not been registered.`,
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
        finger_print: fingerprint,
      },
      data: {
        is_trusted: true,
      },
    });

    if (existingUser.two_factor_enabled) {
      return;
    }

    const data = await this.signInByKeycloak(email, password);

    const decoded: any = jwtDecode(data?.access_token);

    const clientRoles = decoded?.resource_access?.[this.clientId]?.roles || [];

    return {
      access_token: data?.access_token,
      refresh_token: data?.refresh_token,
      role: clientRoles,
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
        role: Role.user,
      },
    });

    await this.prismaService.userProfiles.create({
      data: {
        ...res,
        avatar_url: this.configService.get<string>('default_avatar_url', ''),
        cover_photo_url: this.configService.get<string>(
          'default_cover_photo',
          '',
        ),
        user: {
          connect: {
            id: newUser.id,
          },
        },
      },
    });

    await this.createNewUserDevice(finger_print, deviceDetailsDto, newUser.id);

    await this.createNewOAuthAcccount(OAuthProvider.local, newUser.id);

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

    if (existingEmail.oauth_account?.provider !== OAuthProvider.local)
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

      if (existingEmail.oauth_account?.provider !== OAuthProvider.local)
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
        throw new BadRequestException(
          'The authorization code you provided has expired.',
        );
      } else {
        throw new BadRequestException(
          'The authorization code you provided is invalid.',
        );
      }
    }
  };

  private createNewOAuthAcccount = async (
    provider: OAuthProvider,
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

  private createNewUserDevice = async (
    finger_print: string,
    deviceDetailsDto: DeviceDetailsDto,
    userId: string,
  ) => {
    await this.prismaService.userDevices.upsert({
      where: { finger_print },
      update: {
        ...deviceDetailsDto,
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
      },
    });
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
        message: 'A system error has occurred. Please try again.',
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

      const clientId = await this.getClientId(this.clientId);

      const roles = await this.getClientRoles(clientId);

      const userRole = roles.find((role) => role.name === 'user');

      if (!userRole)
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Role user not found.`,
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
    } catch (error) {
      console.error(error?.response?.data || error?.message);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A system error has occurred. Please try again.',
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
        message: 'A system error has occurred. Please try again.',
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
        message: 'A system error has occurred. Please try again.',
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
}
