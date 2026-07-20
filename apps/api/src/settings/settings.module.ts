import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { NuvemshopModule } from '../nuvemshop/nuvemshop.module';
import { BlingModule } from '../bling/bling.module';
import { EvolutionModule } from '../evolution/evolution.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [NuvemshopModule, BlingModule, EvolutionModule, SyncModule],
  controllers: [SettingsController],
})
export class SettingsModule {}
