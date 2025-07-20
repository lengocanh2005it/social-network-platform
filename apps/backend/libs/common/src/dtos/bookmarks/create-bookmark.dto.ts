import { IsUUID } from 'class-validator';

export class CreateBookMarkDto {
  @IsUUID('4')
  readonly postId!: string;
}
