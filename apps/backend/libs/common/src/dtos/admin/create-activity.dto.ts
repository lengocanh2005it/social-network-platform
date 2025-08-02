import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  readonly action!: string;

  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, any>;
}
