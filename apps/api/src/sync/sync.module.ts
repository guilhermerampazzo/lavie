import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SyncService } from './sync.service';
import { SyncProcessor } from './sync.processor';
import { NuvemshopModule } from '../nuvemshop/nuvemshop.module';

@Module({
  imports: [NuvemshopModule, BullModule.registerQueue({ name: 'sync-jobs' })],
  providers: [SyncService, SyncProcessor],
  exports: [SyncService, BullModule],
})
export class SyncModule {}
