import { Module } from '@nestjs/common';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { NuvemshopModule } from '../nuvemshop/nuvemshop.module';

@Module({
  imports: [NuvemshopModule],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
