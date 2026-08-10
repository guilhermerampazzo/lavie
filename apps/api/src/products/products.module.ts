import { Module } from '@nestjs/common';
import { AiService } from '@lavie/ai';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { NuvemshopModule } from '../nuvemshop/nuvemshop.module';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [NuvemshopModule, SuppliersModule],
  controllers: [ProductsController],
  providers: [ProductsService, AiService],
})
export class ProductsModule {}
