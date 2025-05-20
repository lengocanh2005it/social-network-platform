import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CloudfareProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  public verifyToken = async (
    token: string,
    remoteIp?: string,
  ): Promise<boolean> => {
    try {
      const params = new URLSearchParams();

      params.append(
        'secret',
        this.configService.get<string>('cloudfare.secret_key', ''),
      );

      params.append('response', token);

      if (remoteIp) {
        params.append('remoteip', remoteIp);
      }

      const response = await firstValueFrom(
        this.httpService.post(
          this.configService.get<string>('cloudfare.url', ''),
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      return response.data.success === true;
    } catch (error) {
      console.error(error);

      return false;
    }
  };
}
