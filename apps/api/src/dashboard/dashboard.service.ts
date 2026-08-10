import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';

type Period = 'today' | 'week' | 'month';

function startOfPeriod(period: Period, offset = 0): Date {
  const now = new Date();
  if (period === 'today') {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7 * (offset + 1));
    return d;
  }
  // month
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return d;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0;
  return ((current - previous) / previous) * 100;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customers: CustomersService,
  ) {}

  /**
   * Métricas principais + comparativo com o período anterior (escopofinal.md 2.1).
   * Inclui: vendas por canal, ticket médio, produtos mais vendidos, maior margem,
   * taxa de conversão (pedidos / clientes do período).
   */
  async metrics(period: Period = 'month') {
    const from = startOfPeriod(period);
    const prevFrom = startOfPeriod(period, 1);

    const [orders, prevOrders] = await Promise.all([
      this.prisma.client.order.findMany({
        where: { createdAt: { gte: from }, status: { not: 'cancelado' } },
        include: { items: { include: { product: true } } },
      }),
      this.prisma.client.order.findMany({
        where: { createdAt: { gte: prevFrom, lt: from }, status: { not: 'cancelado' } },
        include: { items: { include: { product: true } } },
      }),
    ]);

    const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0);
    const ordersCount = orders.length;
    const prevOrdersCount = prevOrders.length;
    const avgTicket = ordersCount > 0 ? revenue / ordersCount : 0;
    const prevAvgTicket = prevOrdersCount > 0 ? prevRevenue / prevOrdersCount : 0;

    // Por canal
    const byChannelMap = new Map<string, number>();
    for (const o of orders) {
      byChannelMap.set(o.channel, (byChannelMap.get(o.channel) ?? 0) + Number(o.total));
    }
    const byChannel = Array.from(byChannelMap.entries()).map(([channel, total]) => ({ channel, total }));

    // Produtos mais vendidos (por quantidade e receita)
    const productSales = new Map<string, { nome: string; qty: number; revenue: number; custo?: number }>();
    for (const o of orders) {
      for (const item of o.items) {
        const key = item.productId ?? item.sku;
        const entry = productSales.get(key) ?? {
          nome: item.name,
          qty: 0,
          revenue: 0,
          custo: item.product?.precoCusto ? Number(item.product.precoCusto) : undefined,
        };
        entry.qty += item.quantity;
        entry.revenue += Number(item.unitPrice) * item.quantity;
        productSales.set(key, entry);
      }
    }
    const topProductsByVolume = Array.from(productSales.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((p) => ({ nome: p.nome, qty: p.qty, revenue: p.revenue }));

    const topProductsByMargin = Array.from(productSales.values())
      .filter((p): p is typeof p & { custo: number } => p.custo !== undefined && p.custo > 0)
      .map((p) => ({
        nome: p.nome,
        revenue: p.revenue,
        custo: p.custo,
        margin: ((p.revenue - p.custo * p.qty) / p.revenue) * 100,
      }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);

    // Taxa de conversão: pedidos únicos / clientes ativos no período (aproximação
    // sem dados de visita — escopofinal.md 2.1). clientes = total de clientes
    // cadastrados até o fim do período.
    const customersCount = await this.prisma.client.customer.count({
      where: { createdAt: { lte: from } },
    });
    const conversionRate = customersCount > 0 ? (ordersCount / customersCount) * 100 : 0;

    // Ranking de revendedoras
    const resellerOrders = await this.prisma.client.resellerOrder.findMany({
      where: { order: { createdAt: { gte: from } } },
      include: { order: true, reseller: true },
    });
    const rankingMap = new Map<string, number>();
    for (const ro of resellerOrders) {
      if (!ro.order) continue;
      rankingMap.set(ro.reseller.name, (rankingMap.get(ro.reseller.name) ?? 0) + Number(ro.order.total));
    }
    const resellerRanking = Array.from(rankingMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Comissões a pagar (afiliadas) — escopofinal.md 2.3
    const commissions = await this.prisma.client.commission.findMany({
      where: { status: { in: ['pendente', 'aprovado'] } },
      include: { affiliate: true },
    });
    const commissionsToPay = commissions.reduce((s, c) => s + Number(c.amount), 0);
    const affiliateCommissionRanking = Array.from(
      commissions.reduce((map, c) => {
        const name = c.affiliate.name;
        map.set(name, (map.get(name) ?? 0) + Number(c.amount));
        return map;
      }, new Map<string, number>()),
    )
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      revenue,
      prevRevenue,
      revenueChange: pctChange(revenue, prevRevenue),
      avgTicket,
      prevAvgTicket,
      avgTicketChange: pctChange(avgTicket, prevAvgTicket),
      ordersCount,
      prevOrdersCount,
      ordersChange: pctChange(ordersCount, prevOrdersCount),
      conversionRate,
      byChannel,
      topProductsByVolume,
      topProductsByMargin,
      resellerRanking,
      commissionsToPay,
      affiliateCommissionRanking,
    };
  }

  /**
   * Métricas de estoque — escopofinal.md 2.2:
   * total por categoria, parados 30/60/90d, crítico (abaixo do mínimo), giro, localização.
   */
  async stock() {
    const products = await this.prisma.client.product.findMany({
      where: { status: 'active' },
      include: { variants: true, category: true },
    });

    const totalByCategory = new Map<string, number>();
    let totalUnits = 0;

    for (const p of products) {
      const stock = p.variants.reduce((s, v) => s + v.estoque, 0);
      totalUnits += stock;
      const cat = p.category?.name ?? 'Sem categoria';
      totalByCategory.set(cat, (totalByCategory.get(cat) ?? 0) + stock);
    }

    // Produtos parados: sem venda nos últimos 30/60/90 dias
    const cutoffs = [30, 60, 90];
    const soldProductIds = new Map<string, Date>();
    const ordersFull = await this.prisma.client.order.findMany({
      where: { status: { not: 'cancelado' } },
      select: { createdAt: true, items: { select: { productId: true } } },
    });
    for (const o of ordersFull) {
      for (const item of o.items) {
        if (!item.productId) continue;
        const prev = soldProductIds.get(item.productId);
        if (!prev || o.createdAt > prev) soldProductIds.set(item.productId, o.createdAt);
      }
    }

    const now = Date.now();
    const stagnant = cutoffs.map((days) => ({
      days,
      count: products.filter((p) => {
        const lastSale = soldProductIds.get(p.id);
        if (!lastSale) return true; // nunca vendeu
        return now - lastSale.getTime() > days * 24 * 60 * 60 * 1000;
      }).length,
    }));

    // Estoque crítico: abaixo do mínimo definido
    const critical: Array<{ id: string; nome: string; estoque: number; minimo: number }> = [];
    for (const p of products) {
      const stock = p.variants.reduce((s, v) => s + v.estoque, 0);
      if (p.estoqueMinimo > 0 && stock < p.estoqueMinimo) {
        critical.push({ id: p.id, nome: p.nomeGerado, estoque: stock, minimo: p.estoqueMinimo });
      }
    }

    // Giro: vendas (unidades) por produto no período total
    const productQty = new Map<string, number>();
    for (const o of ordersFull) {
      for (const item of o.items) {
        if (!item.productId) continue;
        productQty.set(item.productId, (productQty.get(item.productId) ?? 0) + 1);
      }
    }
    const turnover = Array.from(productQty.entries())
      .map(([id, qty]) => {
        const p = products.find((x) => x.id === id);
        const stock = p ? p.variants.reduce((s, v) => s + v.estoque, 0) : 0;
        return { nome: p?.nomeGerado ?? id, vendas: qty, estoque: stock, giro: stock > 0 ? qty / stock : qty };
      })
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 5);

    // Localização: próprio (variants.estoque) + consignação
    const consignments = await this.prisma.client.consignment.findMany({
      where: { status: 'em_posse' },
      select: { quantity: true },
    });
    const consignedUnits = consignments.reduce((s, c) => s + c.quantity, 0);

    return {
      totalUnits,
      totalProducts: products.length,
      byCategory: Array.from(totalByCategory.entries()).map(([category, total]) => ({ category, total })),
      stagnant,
      critical: critical.slice(0, 10),
      criticalCount: critical.length,
      turnover,
      byLocation: [
        { location: 'próprio', units: totalUnits },
        { location: 'consignação', units: consignedUnits },
        { location: 'com revendedoras', units: 0 }, // sem modelo de venda em revendedora ainda
      ],
    };
  }

  /**
   * Ranking de influenciadoras + ROI — escopofinal.md 2.3.
   */
  async affiliateRanking() {
    const affiliates = await this.prisma.client.affiliate.findMany({
      include: { trackingLinks: true, commissions: { include: { order: true } } },
    });

    const ranking = affiliates.map((a) => {
      const conversions = a.trackingLinks.reduce((s, l) => s + l.conversions, 0);
      const revenue = a.commissions.reduce((s, c) => s + Number(c.order?.total ?? 0), 0);
      const commissionTotal = a.commissions.reduce((s, c) => s + Number(c.amount), 0);
      const roi = commissionTotal > 0 ? revenue / commissionTotal : null;
      return {
        id: a.id,
        name: a.name,
        channel: a.channel,
        conversions,
        revenue,
        commissionTotal,
        roi,
      };
    });

    return ranking.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }

  async alerts() {
    const alerts: Array<{ id: string; severity: 'warning' | 'danger'; message: string; href?: string }> = [];

    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const stuckOrders = await this.prisma.client.order.findMany({
      where: { status: 'pago', createdAt: { lte: fourHoursAgo } },
      take: 5,
    });
    for (const o of stuckOrders) {
      alerts.push({
        id: `order-${o.id}`,
        severity: 'warning',
        message: `Pedido #${o.id.slice(-6)} pago aguardando separação`,
        href: `/pedidos/${o.id}`,
      });
    }

    const products = await this.prisma.client.product.findMany({
      where: { status: 'active' },
      include: { variants: true },
    });
    for (const p of products) {
      const totalStock = p.variants.reduce((sum, v) => sum + v.estoque, 0);
      if (totalStock === 0) {
        alerts.push({
          id: `stock-${p.id}`,
          severity: 'danger',
          message: `${p.nomeGerado} esgotado, ainda ativo`,
          href: `/produtos/${p.id}`,
        });
      } else if (p.estoqueMinimo > 0 && totalStock < p.estoqueMinimo) {
        alerts.push({
          id: `stockmin-${p.id}`,
          severity: 'warning',
          message: `${p.nomeGerado} abaixo do estoque mínimo (${totalStock}/${p.estoqueMinimo})`,
          href: `/produtos/${p.id}`,
        });
      }
    }

    const customers = await this.customers.list({});
    for (const c of customers) {
      if (c.segments.includes('vip') && c.segments.includes('a_reativar')) {
        alerts.push({
          id: `vip-${c.id}`,
          severity: 'warning',
          message: `${c.name} (VIP) está inativa`,
          href: `/clientes/${c.id}`,
        });
      }
    }

    const pendingResellers = await this.prisma.client.reseller.count({ where: { status: 'pendente' } });
    if (pendingResellers > 0) {
      alerts.push({
        id: 'resellers-pending',
        severity: 'warning',
        message: `${pendingResellers} revendedora(s) aguardando aprovação`,
        href: '/revendedoras',
      });
    }

    return alerts.slice(0, 10);
  }
}
