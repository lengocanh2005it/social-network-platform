import { UploadUserImageQueryDto } from '@app/common/dtos/users';
import { formatFileSize, UploadUserImageTypeEnum } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { UsersType } from '@repo/db';
import { CloudinaryService } from 'nestjs-cloudinary';
import { firstValueFrom } from 'rxjs';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService implements OnModuleInit {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.usersClient.subscribeToResponseOf('get-me');
  }

  public uploadUserImage = async (
    email: string,
    uploadUserImageQueryDto: UploadUserImageQueryDto,
    file: Express.Multer.File,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send('get-me', {
        email,
      }),
    );

    const { fileUrl } = await this.uploadImage(file);

    this.usersClient.emit(
      'update-image',
      JSON.stringify({
        fileUrl,
        uploadUserImageQueryDto,
        user_id: user.id,
      }),
    );

    return {
      message: `Your ${
        uploadUserImageQueryDto.type === UploadUserImageTypeEnum.AVATAR
          ? 'profile'
          : 'cover photo'
      } picture has been updated successfully!`,
      imageUrl: fileUrl,
      success: true,
    };
  };

  public uploadMedia = async (files: Express.Multer.File[]) => {
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const result = await this.uploadImage(file);

        const mimetype = file.mimetype;

        const type = mimetype.startsWith('image/')
          ? 'image'
          : mimetype.startsWith('video/')
            ? 'video'
            : 'other';

        return {
          ...result,
          type,
        };
      }),
    );

    return { media: uploadResults };
  };

  private uploadImage = async (file: Express.Multer.File) => {
    if (!(file.buffer instanceof Buffer)) {
      file.buffer = Buffer.from((file.buffer as any).data);
    }

    file.stream = Readable.from(file.buffer);

    const originalFileName = file.originalname;

    const uniqueFileName = originalFileName.split('.')[0] + '-' + uuidv4();

    const uploadResult = await this.cloudinaryService.uploadFile(file, {
      public_id: uniqueFileName,
    });

    const formattedFileSize = formatFileSize(uploadResult.bytes);

    return {
      message: 'File uploaded successfully!',
      fileUrl: uploadResult.secure_url,
      fileName: uploadResult.public_id,
      fileSize: formattedFileSize,
    };
  };
}
