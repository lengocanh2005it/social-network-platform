import { InfisicalProvider } from '@app/common/providers';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { authenticator } from 'otplib';
import * as qrCode from 'qrcode';

@Injectable()
export class TwoFactorAuthProvider {
  constructor(
    private readonly infisicalProvider: InfisicalProvider,
    private readonly configService: ConfigService,
  ) {}

  public generate2FASecret = async (email: string) => {
    try {
      const secret = authenticator.generateSecret();

      const otpAuthUrl = authenticator.keyuri(
        email,
        this.configService.get<string>('application_name', ''),
        secret,
      );

      await this.infisicalProvider.setSecret(`TOTP_SECRET_${email}`, secret);

      return {
        otpAuthUrl,
      };
    } catch (error) {
      console.error('Failed to store secret in Infisical due to: ', error);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          'Something went wrong while creating your 2FA QR code. Please try again later.',
      });
    }
  };

  public generate2FAQrCode = async (otpAuthUrl: string) => {
    try {
      const qrCodeDataUrl = await qrCode.toDataURL(otpAuthUrl);

      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR Code: due to: ', error);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          'Something went wrong while creating your 2FA QR code. Please try again later.',
      });
    }
  };

  public verify2FAOtp = (otp: string, secret: string) => {
    return authenticator.verify({ token: otp, secret });
  };
}
