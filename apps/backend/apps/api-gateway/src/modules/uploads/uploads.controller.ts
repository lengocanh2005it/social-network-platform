import { UploadUserImageQueryDto } from '@app/common/dtos/users';
import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { KeycloakUser } from 'nest-keycloak-connect';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('user')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserImage(
    @KeycloakUser() user: any,
    @Query() uploadUserImageQueryDto: UploadUserImageQueryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.uploadsService.uploadUserImage(
      email,
      uploadUserImageQueryDto,
      file,
    );
  }

  @Post('media')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMedia(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadsService.uploadMedia(files);
  }
}
