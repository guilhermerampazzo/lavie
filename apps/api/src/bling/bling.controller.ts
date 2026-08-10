import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BlingService } from './bling.service';
import { BlingSyncService } from './bling-sync.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('bling')
export class BlingController {
  constructor(
    private readonly service: BlingService,
    private readonly syncService: BlingSyncService,
  ) {}

  /** Estado da conexão (validada com chamada real). */
  @Get('status')
  status() {
    return this.syncService.validateConnection();
  }

  /** Dados consolidados para o painel (NFs, contas, resumo). */
  @Get('dashboard')
  dashboard() {
    return this.syncService.dashboard();
  }

  /** Sincroniza NFs + contas a receber/pagar do Bling para o banco. */
  @Post('sync')
  sync() {
    return this.syncService.syncAll();
  }
}
