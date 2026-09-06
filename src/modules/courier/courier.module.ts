import { Module } from '@nestjs/common';
import { CourierController } from './courier.controller';
import { CourierService } from './courier.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [CourierController],
  providers: [CourierService],
})
export class CourierModule {}
