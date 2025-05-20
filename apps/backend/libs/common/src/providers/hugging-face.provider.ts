import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HuggingFaceProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  public analyzeText = async (text: string) => {
    const response = await firstValueFrom(
      this.httpService.post(
        this.configService.get<string>('hugging_face.api_url', ''),
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>('hugging_face.api_token', '')}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data;
  };
}
