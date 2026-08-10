import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';

/**
 * Relatórios automáticos (escopofinal.md 10.4): gera snapshots semanais dos
 * relatórios principais (vendas, afiliadas, financeiro) para consulta no
 * painel. O envio por e-mail pode ser plugado depois (SMTP).
 */
@Injectable()
export class ReportsAutomationService {
  private readonly logger = new Logger(ReportsAutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reports: ReportsService,
  ) {}

  async generateSnapshot() {
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth() - 1, 1); // último mês

    const [sales, affiliates, financial] = await Promise.all([
      this.reports.salesReport(from, to),
      this.reports.affiliateReport(from, to),
      this.reports.financialReport(from, to),
    ]);

    const snapshot = await this.prisma.client.setting.upsert({
      where: { key: 'report_snapshot' },
      update: {
        value: {
          generatedAt: to.toISOString(),
          period: { from: from.toISOString(), to: to.toISOString() },
          sales,
          affiliates,
          financial,
        } as never,
      },
      create: {
        key: 'report_snapshot',
        value: {
          generatedAt: to.toISOString(),
          period: { from: from.toISOString(), to: to.toISOString() },
          sales,
          affiliates,
          financial,
        } as never,
      },
    });

    this.logger.log(
      `Snapshot de relatórios gerado: vendas R$ ${sales.totalRevenue.toFixed(2)}, lucro líquido R$ ${financial.netProfit.toFixed(2)}`,
    );
    return snapshot;
  }

  async getSnapshot() {
    const setting = await this.prisma.client.setting.findUnique({ where: { key: 'report_snapshot' } });
    return setting?.value ?? null;
  }
}
