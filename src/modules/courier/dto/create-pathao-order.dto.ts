import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PathaoEnvironment } from './Issue-pathao-token-dto';

export class CreatePathaoOrderDto {
  @ApiProperty({
    example: 12345,
    description: 'Pathao merchant pickup store ID.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  storeId!: number;

  @ApiPropertyOptional({
    example: 'ORD-20260806-0001',
    description: 'Your website order number or tracking ID.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  merchantOrderId?: string;

  @ApiProperty({
    example: 'Demo Recipient',
    description: 'Parcel receiver name.',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  recipientName!: string;

  @ApiProperty({
    example: '01712345678',
    description: 'Parcel receiver phone number.',
  })
  @IsString()
  @Matches(/^01[3-9]\d{8}$/, {
    message: 'recipientPhone must be a valid 11-digit Bangladeshi number.',
  })
  recipientPhone!: string;

  @ApiPropertyOptional({
    example: '01512345678',
    description: 'Parcel receiver secondary phone number.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^01[3-9]\d{8}$/, {
    message:
      'recipientSecondaryPhone must be a valid 11-digit Bangladeshi number.',
  })
  recipientSecondaryPhone?: string;

  @ApiProperty({
    example: 'House 123, Road 4, Sector 10, Uttara, Dhaka-1230, Bangladesh',
    description: 'Parcel receiver full address.',
    minLength: 10,
    maxLength: 220,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(220)
  recipientAddress!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Pathao recipient city ID.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  recipientCity?: number;

  @ApiPropertyOptional({
    example: 1070,
    description: 'Pathao recipient zone ID.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  recipientZone?: number;

  @ApiPropertyOptional({
    example: 37,
    description: 'Pathao recipient area ID.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  recipientArea?: number;

  @ApiProperty({
    enum: [48, 12],
    example: 48,
    description: '48 for Normal Delivery, 12 for On Demand Delivery.',
  })
  @Type(() => Number)
  @IsInt()
  @IsIn([48, 12], {
    message: 'deliveryType must be 48 or 12.',
  })
  deliveryType!: 48 | 12;

  @ApiProperty({
    enum: [1, 2],
    example: 2,
    description: '1 for Document, 2 for Parcel.',
  })
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2], {
    message: 'itemType must be 1 or 2.',
  })
  itemType!: 1 | 2;

  @ApiPropertyOptional({
    example: 'Need to deliver before 5 PM.',
    description: 'Special delivery instruction.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialInstruction?: string;

  @ApiProperty({
    example: 1,
    description: 'Number of parcels.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  itemQuantity!: number;

  @ApiProperty({
    example: 0.5,
    minimum: 0.5,
    maximum: 10,
    description: 'Parcel weight in kilograms.',
  })
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0.5)
  @Max(10)
  itemWeight!: number;

  @ApiPropertyOptional({
    example: 'Clothing item, price BDT 3000.',
    description: 'Parcel item description.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  itemDescription?: string;

  @ApiProperty({
    example: 900,
    minimum: 0,
    description: 'COD amount. Use 0 for non-COD orders.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountToCollect!: number;

  @ApiProperty({
    enum: PathaoEnvironment,
    example: 'SANDBOX',
    description: 'Pathao API environment.',
  })
  @IsEnum(PathaoEnvironment, {
    message: 'environment must be SANDBOX or LIVE.',
  })
  environment!: PathaoEnvironment;
}