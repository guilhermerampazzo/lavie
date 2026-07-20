import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlingClient } from '@lavie/bling';

@Injectable()
export class BlingService {
  private readonly logger = new Logger(BlingService.name);
  readonly client: BlingClient;
  readonly configured: boolean;

  constructor(config: ConfigService) {
    const clientId = config.get<string>('BLING_CLIENT_ID') ?? '';
    const accessToken = config.get<string>('BLING_ACCESS_TOKEN') ?? '';
    this.configured = Boolean(clientId && accessToken);

    this.client = new BlingClient({
      clientId,
      clientSecret: config.get<string>('BLING_CLIENT_SECRET') ?? '',
      accessToken,
      refreshToken: config.get<string>('BLING_REFRESH_TOKEN') ?? '',
    });

    if (!this.configured) {
      this.logger.warn('Credenciais do Bling não configuradas — emissão de NF-e ficará indisponível.');
    }
  }
}
