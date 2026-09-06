import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({
    description: 'Application health check',
    schema: {
      example: {
        status: 'ok',
        uptime: 120.55,
      },
    },
  })
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
    };
  }
}
