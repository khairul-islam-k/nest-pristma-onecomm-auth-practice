import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourierService } from './courier.service';
import { IssuePathaoTokenDto } from './dto/Issue-pathao-token-dto';
import { CreatePathaoStoreDto } from './dto/create-pathao-store-dto';
import { PathaoEnvironmentQueryDto } from './dto/pathao-environment-query-dto';
import { CreatePathaoOrderDto } from './dto/create-pathao-order.dto';

@ApiTags('Courier - Pathao')
@Controller('courier')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get('cities')
  @ApiOperation({
    summary: 'Get Pathao city list',
  })
  @ApiQuery({
    name: 'environment',
    enum: ['SANDBOX', 'LIVE'],
    example: 'SANDBOX',
    required: true,
  })
  getPathaoCities(@Query() query: PathaoEnvironmentQueryDto) {
    return this.courierService.getPathaoCities(query.environment);
  }

  @Get('cities/:cityId/zones')
  @ApiOperation({
    summary: 'Get Pathao zones by city ID',
  })
  @ApiParam({
    name: 'cityId',
    type: Number,
    example: 1,
    description: 'Unique Pathao city ID.',
  })
  @ApiQuery({
    name: 'environment',
    enum: ['SANDBOX', 'LIVE'],
    example: 'SANDBOX',
    required: true,
  })
  getPathaoZones(
    @Param('cityId', ParseIntPipe) cityId: number,
    @Query() query: PathaoEnvironmentQueryDto,
  ) {
    return this.courierService.getPathaoZones(cityId, query.environment);
  }

  @Get('zones/:zoneId/areas')
  @ApiOperation({
    summary: 'Get Pathao areas by zone ID',
  })
  @ApiParam({
    name: 'zoneId',
    type: Number,
    example: 298,
    description: 'Unique Pathao zone ID.',
  })
  @ApiQuery({
    name: 'environment',
    enum: ['SANDBOX', 'LIVE'],
    example: 'SANDBOX',
    required: true,
  })
  getPathaoAreas(
    @Param('zoneId', ParseIntPipe) zoneId: number,
    @Query() query: PathaoEnvironmentQueryDto,
  ) {
    return this.courierService.getPathaoAreas(zoneId, query.environment);
  }

  @Get('orders/:consignmentId/info')
  @ApiOperation({
    summary: 'Get Pathao order information by consignment ID',
  })
  @ApiParam({
    name: 'consignmentId',
    type: String,
    example: 'DHA-123456789',
    description: 'Unique Pathao consignment ID.',
  })
  @ApiQuery({
    name: 'environment',
    enum: ['SANDBOX', 'LIVE'],
    example: 'SANDBOX',
    required: true,
  })
  getPathaoOrderInfo(
    @Param('consignmentId') consignmentId: string,
    @Query() query: PathaoEnvironmentQueryDto,
  ) {
    return this.courierService.getPathaoOrderInfo(
      consignmentId,
      query.environment,
    );
  }

  @Post('tokens/issue')
  @ApiOperation({
    summary: 'Issue and save a new Pathao access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Pathao token issued and stored successfully.',
  })
  issuePathaoToken(@Body() dto: IssuePathaoTokenDto) {
    return this.courierService.issueAndStorePathaoToken(dto);
  }

  @Post('stores')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new Pathao pickup store',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pathao store created successfully.',
  })
  createPathaoStore(@Body() dto: CreatePathaoStoreDto) {
    return this.courierService.createPathaoStore(dto);
  }

  @Post('orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create a new Pathao courier order',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pathao order created successfully.',
  })
  createPathaoOrder(@Body() dto: CreatePathaoOrderDto,) {
    return this.courierService.createPathaoOrder(dto);
  }
}
