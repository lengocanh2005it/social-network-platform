import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

export type GeminiProvider = GoogleGenAI;
export const geminiProvider = {
  provide: 'GEMINI',
  useFactory: (configService: ConfigService) => {
    return new GoogleGenAI({
      apiKey: configService.get<string>('google_gemini_api_key', ''),
    });
  },
  inject: [ConfigService],
};
