import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { NuvemshopModule } from '../nuvemshop/nuvemshop.module';

@Module({
  imports: [NuvemshopModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
