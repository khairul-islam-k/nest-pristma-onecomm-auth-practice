import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum PathaoEnvironment {
  SANDBOX = 'SANDBOX',
  LIVE = 'LIVE',
}

export class PathaoEnvironmentQueryDto {
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
