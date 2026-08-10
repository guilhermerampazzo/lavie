import { Module } from '@nestjs/common';
import { BlingService } from './bling.service';
import { BlingSyncService } from './bling-sync.service';
import { BlingController } from './bling.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BlingController],
  providers: [BlingService, BlingSyncService],
  exports: [BlingService, BlingSyncService],
})
export class BlingModule {}
