import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum PathaoEnvironment {
  SANDBOX = 'SANDBOX',
  LIVE = 'LIVE',
}

export class IssuePathaoTokenDto {
  @ApiProperty({
    example: '7N1aMJQbWm',
    description: 'Pathao Sandbox or Live client ID.',
  })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({
    example: 'wRcaibZkUdSNz2EI9ZyuXLlNrnAv0TdPUPXMnD39',
    description: 'Pathao Sandbox or Live client secret.',
  })
  @IsString()
  @IsNotEmpty()
  clientSecret!: string;

  @ApiProperty({
    example: 'password',
    default: 'password',
    description: 'Pathao requires the grant type to be password.',
  })
  @IsString()
  @IsOptional()
  @Equals('password', {
    message: 'grantType must be password.',
  })
  grantType!: 'password';

  @ApiProperty({
    example: 'test@pathao.com',
    description: 'Pathao Merchant account login email.',
  })
  @IsEmail()
  @IsOptional()
  username!: string;

  @ApiProperty({
    example: 'lovePathao',
    description: 'Pathao Merchant account login password.',
  })
  @IsString()
  @IsOptional()
  password!: string;

  @ApiProperty({
    enum: PathaoEnvironment,
    example: PathaoEnvironment.SANDBOX,
    description: 'Pathao API environment.',
  })
  @IsEnum(PathaoEnvironment, {
    message: 'environment must be SANDBOX or LIVE.',
  })
  environment!: PathaoEnvironment;
}
