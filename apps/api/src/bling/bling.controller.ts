import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { randomBytes } from 'crypto';
import { BlingService } from './bling.service';

@Controller('bling')
export class BlingController {
  constructor(private readonly bling: BlingService) {}

  @Get('authorize')
  authorize(@Res() res: Response) {
    if (!this.bling.hasClientCredentials()) {
      return res.status(400).send('BLING_CLIENT_ID/BLING_CLIENT_SECRET não configurados no .env.');
    }
    const state = randomBytes(16).toString('hex');
    return res.redirect(this.bling.buildAuthorizeUrl(state));
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('error') error: string, @Res() res: Response) {
    const publicUrl = process.env.PUBLIC_URL ?? '';

    if (error || !code) {
      return res.redirect(`${publicUrl}/configuracoes?bling=erro`);
    }

    try {
      await this.bling.exchangeCode(code);
      return res.redirect(`${publicUrl}/configuracoes?bling=conectado`);
    } catch {
      return res.redirect(`${publicUrl}/configuracoes?bling=erro`);
    }
  }
}
