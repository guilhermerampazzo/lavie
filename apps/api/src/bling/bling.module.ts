import { Module } from '@nestjs/common';
import { BlingService } from './bling.service';
import { BlingController } from './bling.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BlingController],
  providers: [BlingService],
  exports: [BlingService],
})
export class BlingModule {}
