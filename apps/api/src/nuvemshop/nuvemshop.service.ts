import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NuvemshopClient } from '@lavie/nuvemshop';

const WEBHOOK_EVENTS = [
  'order/created',
  'order/paid',
  'order/updated',
  'order/cancelled',
  'order/fulfilled',
  'product/created',
  'product/updated',
  'customer/created',
  'customer/updated',
];

@Injectable()
export class NuvemshopService {
  private readonly logger = new Logger(NuvemshopService.name);
  readonly client: NuvemshopClient;
  readonly configured: boolean;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const storeId = config.get<string>('NUVEMSHOP_STORE_ID') ?? '';
    const accessToken = config.get<string>('NUVEMSHOP_ACCESS_TOKEN') ?? '';
    this.configured = Boolean(storeId && accessToken);
    this.publicUrl = config.get<string>('PUBLIC_URL') ?? 'http://localhost:10215';

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

  /**
   * Registra na Nuvemshop os webhooks necessarios para sync em tempo real
   * (pedido criado/pago/atualizado, produto e cliente). Idempotente — pula
   * eventos ja cadastrados apontando para a mesma URL.
   */
  async registerWebhooks(): Promise<{ created: string[]; alreadyRegistered: string[] }> {
    const callbackUrl = `${this.publicUrl}/api/webhooks/nuvemshop`;
    const existing = (await this.client.webhooks.list()) as Array<{ event: string; url: string }>;
    const existingEvents = new Set(existing.filter((w) => w.url === callbackUrl).map((w) => w.event));

    const created: string[] = [];
    const alreadyRegistered: string[] = [];

    for (const event of WEBHOOK_EVENTS) {
      if (existingEvents.has(event)) {
        alreadyRegistered.push(event);
        continue;
      }
      await this.client.webhooks.create({ event, url: callbackUrl });
      created.push(event);
    }

    return { created, alreadyRegistered };
  }
}
