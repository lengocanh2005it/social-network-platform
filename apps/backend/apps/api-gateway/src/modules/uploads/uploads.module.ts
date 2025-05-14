import { CommonModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from 'nestjs-cloudinary';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [
    CommonModule,
    CloudinaryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true,
        cloud_name: configService.get<string>('cloudinary.name', ''),
        api_key: configService.get<string>('cloudinary.api_key', ''),
        api_secret: configService.get<string>('cloudinary.api_secret', ''),
      }),
    }),
  ],
  providers: [UploadsService],
  controllers: [UploadsController],
})
export class UploadsModule {}
