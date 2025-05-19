import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreatePostImageDto {
  @IsUrl()
  @IsNotEmpty()
  readonly image_url!: string;
}
