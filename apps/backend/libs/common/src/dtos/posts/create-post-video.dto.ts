import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreatePostVideoDto {
  @IsUrl()
  @IsNotEmpty()
  readonly video_url!: string;
}
