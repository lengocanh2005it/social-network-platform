import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteBookMarksQueryDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', {
    each: true,
  })
  postIds!: string[];
}
