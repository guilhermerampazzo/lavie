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
}
