import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NuvemshopService } from '../nuvemshop/nuvemshop.service';

type NuvemshopEntity = Record<string, any>;

function firstLang(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Record<string, string>;
    return obj.pt ?? obj.es ?? obj.en ?? Object.values(obj)[0] ?? '';
  }
  return '';
}

const NUVEMSHOP_ORDER_STATUS_MAP: Record<string, string> = {
  open: 'novo',
  pending: 'novo',
  paid: 'pago',
  fulfilled: 'enviado',
  closed: 'entregue',
  cancelled: 'cancelado',
};

const NUVEMSHOP_COUPON_TYPE_MAP: Record<string, string> = {
  absolute: 'fixed',
  percentage: 'percentage',
  shipping: 'free_shipping',
};

/**
 * Sincronizacao inicial / sob demanda Nuvemshop -> CRM.
 *
 * Traz o que ja existe na loja para dentro do banco do CRM (produtos,
 * clientes, pedidos, cupons), usando os *NuvemshopXId como chave de upsert
 * para nao duplicar em execucoes repetidas.
 *
 * IMPORTANTE: os campos lidos aqui (name.pt, variants[].sku, etc.) seguem a
 * documentacao publica da API da Nuvemshop, mas devem ser conferidos contra
 * respostas reais assim que houver um token de acesso configurado — a Nuvemshop
 * pode mudar formato de campo entre versoes (ver CLAUDE.md / escopo.md 8.1).
 */
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nuvemshop: NuvemshopService,
  ) {}

  private async paginate(
    fetchPage: (page: number) => Promise<NuvemshopEntity[]>,
    maxPages = 50,
  ): Promise<NuvemshopEntity[]> {
    const all: NuvemshopEntity[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const items = await fetchPage(page);
      if (!items || items.length === 0) break;
      all.push(...items);
      if (items.length < 200) break;
    }
    return all;
  }

  async syncCategories(): Promise<number> {
    const categories = (await this.nuvemshop.client.categories.list()) as NuvemshopEntity[];
    let count = 0;
    for (const c of categories) {
      const name = firstLang(c.name) || `Categoria ${c.id}`;
      await this.prisma.client.category.upsert({
        where: { nuvemshopCategoryId: String(c.id) },
        update: { name },
        create: { name, nuvemshopCategoryId: String(c.id) },
      });
      count++;
    }
    return count;
  }

  async syncProducts(): Promise<number> {
    await this.syncCategories();

    const products = await this.paginate((page) =>
      this.nuvemshop.client.products.list(`?page=${page}&per_page=200`) as Promise<NuvemshopEntity[]>,
    );

    let count = 0;
    for (const p of products) {
      const nome = firstLang(p.name) || `Produto ${p.id}`;
      const descricao = firstLang(p.description);
      const variants: NuvemshopEntity[] = Array.isArray(p.variants) ? p.variants : [];
      const precoBase = variants[0]?.price ? Number(variants[0].price) : 0;

      let categoryId: string | undefined;
      const firstCategory = Array.isArray(p.categories) ? p.categories[0] : undefined;
      if (firstCategory) {
        const catNuvemshopId = String(typeof firstCategory === 'object' ? firstCategory.id : firstCategory);
        const category = await this.prisma.client.category.findUnique({
          where: { nuvemshopCategoryId: catNuvemshopId },
        });
        categoryId = category?.id;
      }

      const product = await this.prisma.client.product.upsert({
        where: { nuvemshopProductId: String(p.id) },
        update: {
          nomeGerado: nome,
          descricaoGerada: descricao,
          precoBase,
          categoryId,
          status: p.published === false ? 'inactive' : 'active',
        },
        create: {
          nuvemshopProductId: String(p.id),
          nomeGerado: nome,
          descricaoGerada: descricao,
          precoBase,
          categoryId,
          status: p.published === false ? 'inactive' : 'active',
        },
      });

      for (const v of variants) {
        if (!v.sku) continue;
        await this.prisma.client.variant.upsert({
          where: { sku: String(v.sku) },
          update: {
            nuvemshopVariantId: String(v.id),
            preco: Number(v.price ?? 0),
            estoque: Number(v.stock ?? 0),
          },
          create: {
            productId: product.id,
            sku: String(v.sku),
            nuvemshopVariantId: String(v.id),
            preco: Number(v.price ?? 0),
            estoque: Number(v.stock ?? 0),
          },
        });
      }

      count++;
    }
    return count;
  }

  async syncCustomers(): Promise<number> {
    const customers = await this.paginate((page) =>
      this.nuvemshop.client.customers.list(`?page=${page}&per_page=200`) as Promise<NuvemshopEntity[]>,
    );

    let count = 0;
    for (const c of customers) {
      await this.prisma.client.customer.upsert({
        where: { nuvemshopCustomerId: String(c.id) },
        update: {
          name: c.name ?? `Cliente ${c.id}`,
          email: c.email ?? undefined,
          phone: c.phone ?? undefined,
        },
        create: {
          nuvemshopCustomerId: String(c.id),
          name: c.name ?? `Cliente ${c.id}`,
          email: c.email ?? undefined,
          phone: c.phone ?? undefined,
        },
      });
      count++;
    }
    return count;
  }

  async syncOrders(): Promise<number> {
    const orders = await this.paginate((page) =>
      this.nuvemshop.client.orders.list(`?page=${page}&per_page=200`) as Promise<NuvemshopEntity[]>,
    );

    let count = 0;
    for (const o of orders) {
      let customerId: string | undefined;
      if (o.customer?.id) {
        const customer = await this.prisma.client.customer.upsert({
          where: { nuvemshopCustomerId: String(o.customer.id) },
          update: { name: o.customer.name ?? undefined, email: o.customer.email ?? undefined },
          create: {
            nuvemshopCustomerId: String(o.customer.id),
            name: o.customer.name ?? `Cliente ${o.customer.id}`,
            email: o.customer.email ?? undefined,
          },
        });
        customerId = customer.id;
      }

      await this.prisma.client.order.upsert({
        where: { nuvemshopOrderId: String(o.id) },
        update: {
          status: (NUVEMSHOP_ORDER_STATUS_MAP[o.status] ?? 'novo') as never,
          total: Number(o.total ?? 0),
          customerId,
        },
        create: {
          nuvemshopOrderId: String(o.id),
          channel: 'site',
          status: (NUVEMSHOP_ORDER_STATUS_MAP[o.status] ?? 'novo') as never,
          total: Number(o.total ?? 0),
          customerId,
        },
      });
      count++;
    }
    return count;
  }

  async syncCoupons(): Promise<number> {
    const coupons = (await this.nuvemshop.client.coupons.list()) as NuvemshopEntity[];
    let count = 0;
    for (const c of coupons) {
      await this.prisma.client.coupon.upsert({
        where: { nuvemshopCouponId: String(c.id) },
        update: {
          code: c.code,
          type: (NUVEMSHOP_COUPON_TYPE_MAP[c.type] ?? 'fixed') as never,
          value: c.value ? Number(c.value) : undefined,
          usageLimit: c.max_uses ?? undefined,
          active: c.valid ?? true,
        },
        create: {
          nuvemshopCouponId: String(c.id),
          code: c.code,
          type: (NUVEMSHOP_COUPON_TYPE_MAP[c.type] ?? 'fixed') as never,
          value: c.value ? Number(c.value) : undefined,
          usageLimit: c.max_uses ?? undefined,
          active: c.valid ?? true,
        },
      });
      count++;
    }
    return count;
  }

  async runEntity(entity: 'products' | 'customers' | 'orders' | 'coupons'): Promise<number> {
    switch (entity) {
      case 'products':
        return this.syncProducts();
      case 'customers':
        return this.syncCustomers();
      case 'orders':
        return this.syncOrders();
      case 'coupons':
        return this.syncCoupons();
    }
  }
}
