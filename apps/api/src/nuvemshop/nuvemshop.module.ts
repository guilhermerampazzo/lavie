import { Module } from '@nestjs/common';
import { NuvemshopService } from './nuvemshop.service';

@Module({
  providers: [NuvemshopService],
  exports: [NuvemshopService],
})
export class NuvemshopModule {}
