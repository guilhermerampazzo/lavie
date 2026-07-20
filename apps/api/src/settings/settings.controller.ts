import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { NuvemshopService } from '../nuvemshop/nuvemshop.service';
import { BlingService } from '../bling/bling.service';
import { EvolutionService } from '../evolution/evolution.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly nuvemshop: NuvemshopService,
    private readonly bling: BlingService,
    private readonly evolution: EvolutionService,
  ) {}

  @Get('integrations')
  integrations() {
    return {
      nuvemshop: { configured: this.nuvemshop.configured, label: 'Nuvemshop' },
      bling: { configured: this.bling.configured, label: 'Bling (fiscal/financeiro)' },
      evolution: { configured: this.evolution.configured, label: 'Evolution API (WhatsApp)' },
    };
  }
}
