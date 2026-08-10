import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async salesReport(from: Date, to: Date) {
    const orders = await this.prisma.client.order.findMany({
      where: { createdAt: { gte: from, lte: to }, status: { not: 'cancelado' } },
      include: { items: { include: { product: { include: { category: true } } } } },
      orderBy: { createdAt: 'asc' },
    });

    const byChannel = new Map<string, number>();
    const byCategory = new Map<string, number>();
    const byDay = new Map<string, number>();

    for (const o of orders) {
      byChannel.set(o.channel, (byChannel.get(o.channel) ?? 0) + Number(o.total));
      const day = o.createdAt.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + Number(o.total));

      for (const item of o.items) {
        const categoryName = item.product?.category?.name ?? 'Sem categoria';
        byCategory.set(
          categoryName,
          (byCategory.get(categoryName) ?? 0) + Number(item.unitPrice) * item.quantity,
        );
      }
    }

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
      byChannel: Array.from(byChannel.entries()).map(([channel, total]) => ({ channel, total })),
      byCategory: Array.from(byCategory.entries()).map(([category, total]) => ({ category, total })),
      byDay: Array.from(byDay.entries()).map(([day, total]) => ({ day, total })),
    };
  }

  /**
   * Relatório de afiliadas (escopofinal.md 10.2): conversões, receita,
   * comissões e ROI por afiliada no período.
   */
  async affiliateReport(from: Date, to: Date) {
    const affiliates = await this.prisma.client.affiliate.findMany({
      include: {
        trackingLinks: true,
        commissions: { include: { order: true } },
      },
    });

    const rows = affiliates.map((a) => {
      const periodCommissions = a.commissions.filter((c) => {
        if (!c.order) return false;
        return c.order.createdAt >= from && c.order.createdAt <= to;
      });
      const conversions = a.trackingLinks.reduce((s, l) => s + l.conversions, 0);
      const revenue = periodCommissions.reduce((s, c) => s + Number(c.order?.total ?? 0), 0);
      const commissionTotal = periodCommissions.reduce((s, c) => s + Number(c.amount), 0);
      const commissionPending = periodCommissions
        .filter((c) => c.status === 'pendente' || c.status === 'aprovado')
        .reduce((s, c) => s + Number(c.amount), 0);
      const roi = commissionTotal > 0 ? revenue / commissionTotal : null;
      return {
        id: a.id,
        name: a.name,
        channel: a.channel,
        conversions,
        revenue,
        commissionTotal,
        commissionPending,
        roi,
      };
    });

    return {
      totalRevenue: rows.reduce((s, r) => s + r.revenue, 0),
      totalCommissions: rows.reduce((s, r) => s + r.commissionTotal, 0),
      rows: rows.sort((a, b) => b.revenue - a.revenue),
    };
  }

  /**
   * Relatório financeiro — DRE simplificado + margem por produto
   * (escopofinal.md 10.3).
   */
  async financialReport(from: Date, to: Date) {
    const [orders, accounts, commissions] = await Promise.all([
      this.prisma.client.order.findMany({
        where: { createdAt: { gte: from, lte: to }, status: { not: 'cancelado' } },
        include: { items: { include: { product: true } } },
      }),
      this.prisma.client.account.findMany({
        where: { dueDate: { gte: from, lte: to } },
      }),
      this.prisma.client.commission.findMany({}),
    ]);

    const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const cogs = orders.reduce((s, o) => {
      return (
        s +
        o.items.reduce((si, item) => {
          const custo = item.product?.precoCusto ? Number(item.product.precoCusto) : 0;
          return si + custo * item.quantity;
        }, 0)
      );
    }, 0);
    const periodCommissions = commissions
      .filter((c) => c.createdAt >= from && c.createdAt <= to)
      .reduce((s, c) => s + Number(c.amount), 0);
    const expenses = accounts
      .filter((a) => a.type === 'payable')
      .reduce((s, a) => s + Number(a.amount), 0);
    const receivables = accounts
      .filter((a) => a.type === 'receivable')
      .reduce((s, a) => s + Number(a.amount), 0);

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - periodCommissions - expenses;

    // Margem por produto
    const productMap = new Map<string, { nome: string; revenue: number; custo: number; qty: number }>();
    for (const o of orders) {
      for (const item of o.items) {
        if (!item.product) continue;
        const key = item.product.id;
        const entry = productMap.get(key) ?? {
          nome: item.product.nomeGerado,
          revenue: 0,
          custo: 0,
          qty: 0,
        };
        entry.revenue += Number(item.unitPrice) * item.quantity;
        entry.custo += (item.product.precoCusto ? Number(item.product.precoCusto) : 0) * item.quantity;
        entry.qty += item.quantity;
        productMap.set(key, entry);
      }
    }
    const marginByProduct = Array.from(productMap.values())
      .map((p) => ({
        nome: p.nome,
        revenue: p.revenue,
        custo: p.custo,
        margin: p.revenue > 0 ? ((p.revenue - p.custo) / p.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.margin - a.margin);

    return {
      revenue,
      cogs,
      grossProfit,
      grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      commissions: periodCommissions,
      expenses,
      receivables,
      netProfit,
      netMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
      marginByProduct: marginByProduct.slice(0, 15),
    };
  }

  async salesReportCsv(from: Date, to: Date): Promise<string> {
    const orders = await this.prisma.client.order.findMany({
      where: { createdAt: { gte: from, lte: to }, status: { not: 'cancelado' } },
      orderBy: { createdAt: 'asc' },
    });

    const header = 'pedido,data,canal,status,total\n';
    const rows = orders
      .map((o) => [o.id, o.createdAt.toISOString(), o.channel, o.status, o.total.toString()].join(','))
      .join('\n');
    return header + rows;
  }

  /** CSV de afiliadas (abre no Excel com BOM). */
  async affiliateReportCsv(from: Date, to: Date): Promise<string> {
    const report = await this.affiliateReport(from, to);
    const header = 'afiliada,canal,conversoes,receita,comissao_total,comissao_pendente,roi\n';
    const rows = report.rows
      .map((r) =>
        [r.name, r.channel ?? '', r.conversions, r.revenue.toFixed(2), r.commissionTotal.toFixed(2), r.commissionPending.toFixed(2), r.roi?.toFixed(2) ?? ''].join(','),
      )
      .join('\n');
    return header + rows;
  }

  /** CSV financeiro (DRE). */
  async financialReportCsv(from: Date, to: Date): Promise<string> {
    const report = await this.financialReport(from, to);
    const lines = [
      'DRE Simplificado',
      `Período,${from.toISOString().slice(0, 10)},${to.toISOString().slice(0, 10)}`,
      `Receita,${report.revenue.toFixed(2)}`,
      `Custo dos produtos,${report.cogs.toFixed(2)}`,
      `Lucro bruto,${report.grossProfit.toFixed(2)}`,
      `Comissões,${report.commissions.toFixed(2)}`,
      `Despesas,${report.expenses.toFixed(2)}`,
      `A receber,${report.receivables.toFixed(2)}`,
      `Lucro líquido,${report.netProfit.toFixed(2)}`,
      '',
      'Margem por produto',
      'produto,receita,custo,margem_%',
      ...report.marginByProduct.map(
        (p) => `${p.nome},${p.revenue.toFixed(2)},${p.custo.toFixed(2)},${p.margin.toFixed(1)}`,
      ),
    ];
    return lines.join('\n');
  }
}
