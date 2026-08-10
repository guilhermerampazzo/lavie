import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { NuvemshopModule } from '../nuvemshop/nuvemshop.module';
import { ProductsModule } from '../products/products.module';
import { CredentialsModule } from '../credentials/credentials.module';

@Module({
  imports: [NuvemshopModule, ProductsModule, CredentialsModule],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
