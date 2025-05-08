import { GenderEnum } from '@repo/db';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TransformToDate } from 'libs/common/transformers';

export class UpdateSocialsLinkDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly github_link!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly twitter_link!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly instagram_link!: string;
}

export class UpdateEducationsDto {
  @IsString()
  @IsNotEmpty()
  readonly degree!: string;

  @IsString()
  @IsNotEmpty()
  readonly major!: string;

  @IsUUID()
  readonly user_id!: string;

  @IsString()
  @IsNotEmpty()
  readonly school_name!: string;

  @IsString()
  @IsNotEmpty()
  readonly id!: string;

  @IsNotEmpty()
  @IsDate()
  @TransformToDate()
  readonly start_date!: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  @TransformToDate()
  readonly end_date?: Date;

  @IsNotEmpty()
  @IsDate()
  @TransformToDate()
  readonly created_at!: Date;

  @IsNotEmpty()
  @IsDate()
  @TransformToDate()
  readonly updated_at!: Date;
}

export class UpdateWorkPlaceDto {
  @IsUUID()
  readonly user_id!: string;

  @IsString()
  @IsNotEmpty()
  readonly id!: string;

  @IsString()
  @IsNotEmpty()
  readonly company_name!: string;

  @IsString()
  @IsNotEmpty()
  readonly position!: string;

  @IsNotEmpty()
  @IsDate()
  @TransformToDate()
  readonly start_date!: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  @TransformToDate()
  readonly end_date?: Date;

  @IsNotEmpty()
  @IsDate()
  @TransformToDate()
  readonly updated_at!: Date;

  @IsNotEmpty()
  @IsDate()
  @TransformToDate()
  readonly created_at!: Date;
}

export class UpdateInfoDetailsDto {
  @IsPhoneNumber('VN')
  readonly phone_number!: string;

  @IsEnum(GenderEnum)
  readonly gender!: GenderEnum;

  @IsString()
  @IsNotEmpty()
  readonly address!: string;

  @IsString()
  @IsNotEmpty()
  readonly first_name!: string;

  @IsString()
  @IsNotEmpty()
  readonly last_name!: string;

  @IsNotEmpty()
  @IsDate()
  @TransformToDate()
  readonly dob!: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly nickname?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly bio?: string;
}

export class UpdateUserProfileDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSocialsLinkDto)
  @IsNotEmpty()
  readonly socials?: UpdateSocialsLinkDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateEducationsDto)
  @IsArray()
  readonly educations?: UpdateEducationsDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateWorkPlaceDto)
  @IsArray()
  readonly workPlaces?: UpdateWorkPlaceDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfoDetailsDto)
  @IsNotEmpty()
  readonly infoDetails?: UpdateInfoDetailsDto;
}
