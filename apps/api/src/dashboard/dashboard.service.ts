import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';

type Period = 'today' | 'week' | 'month';

function startOfPeriod(period: Period): Date {
  const now = new Date();
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customers: CustomersService,
  ) {}

  async metrics(period: Period = 'month') {
    const from = startOfPeriod(period);
    const orders = await this.prisma.client.order.findMany({
      where: { createdAt: { gte: from }, status: { not: 'cancelado' } },
    });

    const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const ordersCount = orders.length;
    const avgTicket = ordersCount > 0 ? revenue / ordersCount : 0;

    const byChannelMap = new Map<string, number>();
    for (const o of orders) {
      byChannelMap.set(o.channel, (byChannelMap.get(o.channel) ?? 0) + Number(o.total));
    }
    const byChannel = Array.from(byChannelMap.entries()).map(([channel, total]) => ({ channel, total }));

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

    return { revenue, avgTicket, ordersCount, byChannel, resellerRanking };
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
