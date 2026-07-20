import { Module } from '@nestjs/common';
import { BlingService } from './bling.service';

@Module({
  providers: [BlingService],
  exports: [BlingService],
})
export class BlingModule {}
