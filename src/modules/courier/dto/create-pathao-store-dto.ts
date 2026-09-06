import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

import { PathaoEnvironment } from './Issue-pathao-token-dto';

export class CreatePathaoStoreDto {
  @ApiProperty({
    example: 'Demo Store',
    description: 'Name of the Pathao pickup store.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'Test Merchant',
    description: 'Primary contact person name.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contactName!: string;

  @ApiProperty({
    example: '01712345678',
    description: 'Primary Bangladeshi contact number.',
  })
  @IsString()
  @Matches(/^01[3-9]\d{8}$/, {
    message: 'contactNumber must be a valid Bangladeshi phone number.',
  })
  contactNumber!: string;

  @ApiPropertyOptional({
    example: '01512345678',
    description: 'Secondary Bangladeshi contact number.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^01[3-9]\d{8}$/, {
    message: 'secondaryContact must be a valid Bangladeshi phone number.',
  })
  secondaryContact?: string;

  @ApiProperty({
    example: '01712345678',
    description: 'Phone number used by Pathao for OTP verification.',
  })
  @IsString()
  @Matches(/^01[3-9]\d{8}$/, {
    message: 'otpNumber must be a valid Bangladeshi phone number.',
  })
  otpNumber!: string;

  @ApiProperty({
    example: 'House 123, Road 4, Sector 10, Uttara, Dhaka-1230, Bangladesh',
    description: 'Complete Pathao pickup address.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address!: string;

  @ApiProperty({
    example: 1,
    description: 'Pathao city ID.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cityId!: number;

  @ApiProperty({
    example: 1,
    description: 'Pathao zone ID.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  zoneId!: number;

  @ApiProperty({
    example: 1,
    description: 'Pathao area ID.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  areaId!: number;

  @ApiProperty({
    enum: PathaoEnvironment,
    example: PathaoEnvironment.SANDBOX,
    description: 'Pathao environment to use.',
  })
  @IsEnum(PathaoEnvironment, {
    message: 'environment must be SANDBOX or LIVE.',
  })
  environment!: PathaoEnvironment;
}
