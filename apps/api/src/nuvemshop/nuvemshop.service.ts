import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NuvemshopClient } from '@lavie/nuvemshop';

@Injectable()
export class NuvemshopService {
  private readonly logger = new Logger(NuvemshopService.name);
  readonly client: NuvemshopClient;
  readonly configured: boolean;

  constructor(config: ConfigService) {
    const storeId = config.get<string>('NUVEMSHOP_STORE_ID') ?? '';
    const accessToken = config.get<string>('NUVEMSHOP_ACCESS_TOKEN') ?? '';
    this.configured = Boolean(storeId && accessToken);

    this.client = new NuvemshopClient({
      storeId,
      accessToken,
      userAgent: config.get<string>('NUVEMSHOP_USER_AGENT') ?? 'La Vie CRM',
    });

    if (!this.configured) {
      this.logger.warn(
        'NUVEMSHOP_STORE_ID/NUVEMSHOP_ACCESS_TOKEN não configurados — publicação na Nuvemshop ficará indisponível até configurar em Settings.',
      );
    }
  }
}
