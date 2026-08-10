import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NuvemshopService } from '../nuvemshop/nuvemshop.service';
import { ProductsService } from '../products/products.service';
import { CredentialsService } from '../credentials/credentials.service';

export type ChannelKey =
  | 'site'
  | 'nuvemshop'
  | 'instagram'
  | 'tiktok'
  | 'mercado_livre'
  | 'shopee'
  | 'amazon'
  | 'shein'
  | 'revendedora'
  | 'fisico';

/** Canais com credenciais configuráveis na UI (/configuracoes). */
export const CREDENTIAL_CHANNELS: ChannelKey[] = [
  'instagram',
  'tiktok',
  'mercado_livre',
  'shopee',
  'amazon',
  'shein',
];

export interface ChannelAdapter {
  key: ChannelKey;
  label: string;
  /** true quando as credenciais do canal estão configuradas (env ou banco). */
  configured: boolean;
  /** Publica (ou atualiza) o produto no canal. */
  publish(productId: string): Promise<{ externalId?: string; status: 'published' | 'pending'; message?: string }>;
}

/**
 * M8 — Publicação multi-canal (escopofinal.md seção 8).
 *
 * A Nuvemshop é o canal com adapter funcional hoje (publicação real).
 * Marketplaces com credenciais salvas em /configuracoes ficam "configured"
 * e retornam pending com instrução de ativação — a estrutura de adapters
 * está pronta para receber cada integração sem tocar no resto.
 */
@Injectable()
export class ChannelsService {
  private readonly logger = new Logger(ChannelsService.name);
  private readonly adapters: ChannelAdapter[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly nuvemshop: NuvemshopService,
    private readonly products: ProductsService,
    private readonly credentials: CredentialsService,
  ) {
    this.adapters = [
      {
        key: 'nuvemshop',
        label: 'Nuvemshop',
        configured: this.nuvemshop.configured,
        publish: (id) => this.publishNuvemshop(id),
      },
      { key: 'site', label: 'Site (Nuvemshop)', configured: this.nuvemshop.configured, publish: (id) => this.publishNuvemshop(id) },
      { key: 'instagram', label: 'Instagram Shop', configured: false, publish: () => this.pending('Instagram Shop') },
      { key: 'tiktok', label: 'TikTok Shop', configured: false, publish: () => this.pending('TikTok Shop') },
      { key: 'mercado_livre', label: 'Mercado Livre', configured: false, publish: () => this.pending('Mercado Livre') },
      { key: 'shopee', label: 'Shopee', configured: false, publish: () => this.pending('Shopee') },
      { key: 'amazon', label: 'Amazon Brasil', configured: false, publish: () => this.pending('Amazon Brasil') },
      { key: 'shein', label: 'Shein', configured: false, publish: () => this.pending('Shein') },
      { key: 'revendedora', label: 'Portal de Revendedoras', configured: true, publish: () => this.publishReseller() },
      { key: 'fisico', label: 'Físico / PDV', configured: true, publish: () => this.publishReseller() },
    ];
  }

  private pending(label: string) {
    return Promise.resolve({
      status: 'pending' as const,
      message: `${label}: credenciais salvas, mas a integração ainda não foi ativada.`,
    });
  }

  private async publishNuvemshop(productId: string) {
    if (!this.nuvemshop.configured) {
      return { status: 'pending' as const, message: 'Nuvemshop: credenciais não configuradas.' };
    }
    const product = await this.products.publish(productId);
    return {
      status: 'published' as const,
      externalId: product.nuvemshopProductId ?? undefined,
      message: `Nuvemshop: publicado (#${product.nuvemshopProductId}).`,
    };
  }

  private publishReseller() {
    return Promise.resolve({
      status: 'published' as const,
      message: 'Canal interno: produto disponível no catálogo (status ativo).',
    });
  }

  /** Lista canais com status real (credenciais de env + banco). */
  async listChannels() {
    const credStatus = await this.credentials.getStatus();
    return this.adapters.map((a) => {
      const dbCreds = CREDENTIAL_CHANNELS.includes(a.key) ? credStatus[a.key] : undefined;
      return {
        key: a.key,
        label: a.label,
        configured: a.configured || Boolean((dbCreds as { hasCredentials?: boolean } | undefined)?.hasCredentials),
        credentialFields: (dbCreds as { fields?: unknown } | undefined)?.fields ?? null,
      };
    });
  }

  /**
   * Publica o produto nos canais selecionados (ProductChannel) — a equipe
   * escolhe exatamente onde publicar no cadastro. Registra SyncJob por canal.
   */
  async publishProduct(productId: string) {
    const product = await this.prisma.client.product.findUnique({
      where: { id: productId },
      include: { canais: true },
    });
    if (!product) throw new Error('Produto não encontrado');

    const selected = product.canais.map((c) => c.channel);
    if (selected.length === 0) {
      throw new Error('Produto sem canais selecionados — escolha os canais no cadastro.');
    }

    const results: Array<{
      channel: ChannelKey;
      label: string;
      status: 'published' | 'pending' | 'failed';
      externalId?: string;
      message?: string;
    }> = [];
    for (const key of selected) {
      const adapter = this.adapters.find((a) => a.key === key);
      if (!adapter) continue;
      try {
        const result = await adapter.publish(productId);
        await this.prisma.client.syncJob.create({
          data: {
            type: `channel:${key}`,
            status: result.status === 'published' ? 'success' : 'pending',
            error: result.message,
          },
        });
        results.push({ channel: key, label: adapter.label, ...result });
      } catch (err) {
        await this.prisma.client.syncJob.create({
          data: { type: `channel:${key}`, status: 'failed', error: (err as Error).message.slice(0, 500) },
        });
        results.push({ channel: key, label: adapter.label, status: 'failed', message: (err as Error).message });
      }
    }
    return results;
  }
}
