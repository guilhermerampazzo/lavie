import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { NuvemshopModule } from '../nuvemshop/nuvemshop.module';
import { BlingModule } from '../bling/bling.module';
import { EvolutionModule } from '../evolution/evolution.module';

@Module({
  imports: [NuvemshopModule, BlingModule, EvolutionModule],
  controllers: [SettingsController],
})
export class SettingsModule {}
