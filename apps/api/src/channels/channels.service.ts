import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NuvemshopService } from '../nuvemshop/nuvemshop.service';
import { ProductsService } from '../products/products.service';

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

export interface ChannelAdapter {
  key: ChannelKey;
  label: string;
  /** true quando as credenciais do canal estão configuradas no .env */
  configured: boolean;
  /** Publica (ou atualiza) o produto no canal. Deve retornar o id externo. */
  publish(productId: string): Promise<{ externalId?: string; status: 'published' | 'pending'; message?: string }>;
}

/**
 * M8 — Publicação multi-canal (escopofinal.md seção 8).
 *
 * A Nuvemshop é o canal com adapter funcional hoje. Os marketplaces
 * (Mercado Livre, Shopee, Amazon, Shein, TikTok Shop, Instagram) ficam
 * registrados com status "pending" e mensagem clara — a estrutura de
 * adapters está pronta para receber cada integração sem tocar no resto.
 */
@Injectable()
export class ChannelsService {
  private readonly logger = new Logger(ChannelsService.name);
  private readonly adapters: ChannelAdapter[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly nuvemshop: NuvemshopService,
    private readonly products: ProductsService,
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
      message: `${label}: integração registrada — credenciais pendentes de configuração.`,
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
    // Canal interno (portal revendedora/PDV): produto ativo já aparece no catálogo.
    return Promise.resolve({
      status: 'published' as const,
      message: 'Canal interno: produto disponível no catálogo (status ativo).',
    });
  }

  listChannels() {
    return this.adapters.map((a) => ({ key: a.key, label: a.label, configured: a.configured }));
  }

  /**
   * Publica o produto em TODOS os canais selecionados (ProductChannel).
   * Registra um SyncJob por canal para auditoria. Idempotente.
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
