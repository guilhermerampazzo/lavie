import { Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { randomBytes } from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BlingService } from './bling.service';
import { BlingSyncService } from './bling-sync.service';

/**
 * Rotas públicas de OAuth (authorize/callback) + rotas autenticadas de
 * status/dashboard/sync. As rotas OAuth NÃO podem ter guard — o navegador
 * redireciona para o Bling e volta sem token do painel.
 */
@Controller('bling')
export class BlingController {
  constructor(
    private readonly service: BlingService,
    private readonly syncService: BlingSyncService,
  ) {}

  /** OAuth: inicia a conexão (público — redireciona para o Bling). */
  @Get('authorize')
  authorize(@Res() res: Response) {
    if (!this.service.hasClientCredentials()) {
      return res.status(400).send('BLING_CLIENT_ID/BLING_CLIENT_SECRET não configurados no .env.');
    }
    const state = randomBytes(16).toString('hex');
    return res.redirect(this.service.buildAuthorizeUrl(state));
  }

  /** OAuth: retorno do Bling com o code (público). */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const publicUrl = process.env.PUBLIC_URL ?? '';
    if (error || !code) {
      return res.redirect(`${publicUrl}/configuracoes?bling=erro`);
    }
    try {
      await this.service.exchangeCode(code);
      return res.redirect(`${publicUrl}/configuracoes?bling=conectado`);
    } catch {
      return res.redirect(`${publicUrl}/configuracoes?bling=erro`);
    }
  }

  /** Estado da conexão (validada com chamada real). */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'equipe')
  @Get('status')
  status() {
    return this.syncService.validateConnection();
  }

  /** Dados consolidados para o painel (NFs, contas, resumo). */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'equipe')
  @Get('dashboard')
  dashboard() {
    return this.syncService.dashboard();
  }

  /** Sincroniza NFs + contas a receber/pagar do Bling para o banco. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'equipe')
  @Post('sync')
  sync() {
    return this.syncService.syncAll();
  }
}
