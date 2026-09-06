import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Khairul Islam',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'khairul@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
