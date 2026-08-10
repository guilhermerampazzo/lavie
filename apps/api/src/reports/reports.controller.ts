import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReportsService } from './reports.service';

function parseRange(from?: string, to?: string) {
  const toDate = to ? new Date(to) : new Date();
  const fromDate = from ? new Date(from) : new Date(toDate.getFullYear(), toDate.getMonth(), 1);
  return { fromDate, toDate };
}

/** CSV com BOM UTF-8 — abre corretamente no Excel com acentos. */
function csvResponse(res: Response, csv: string, filename: string) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('\uFEFF' + csv);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('sales')
  sales(@Query('from') from?: string, @Query('to') to?: string) {
    const { fromDate, toDate } = parseRange(from, to);
    return this.service.salesReport(fromDate, toDate);
  }

  @Get('affiliates')
  affiliates(@Query('from') from?: string, @Query('to') to?: string) {
    const { fromDate, toDate } = parseRange(from, to);
    return this.service.affiliateReport(fromDate, toDate);
  }

  @Get('financial')
  financial(@Query('from') from?: string, @Query('to') to?: string) {
    const { fromDate, toDate } = parseRange(from, to);
    return this.service.financialReport(fromDate, toDate);
  }

  @Get('sales/export')
  async exportSales(@Query('from') from: string | undefined, @Query('to') to: string | undefined, @Res() res: Response) {
    const { fromDate, toDate } = parseRange(from, to);
    csvResponse(res, await this.service.salesReportCsv(fromDate, toDate), 'relatorio-vendas.csv');
  }

  @Get('affiliates/export')
  async exportAffiliates(@Query('from') from: string | undefined, @Query('to') to: string | undefined, @Res() res: Response) {
    const { fromDate, toDate } = parseRange(from, to);
    csvResponse(res, await this.service.affiliateReportCsv(fromDate, toDate), 'relatorio-afiliadas.csv');
  }

  @Get('financial/export')
  async exportFinancial(@Query('from') from: string | undefined, @Query('to') to: string | undefined, @Res() res: Response) {
    const { fromDate, toDate } = parseRange(from, to);
    csvResponse(res, await this.service.financialReportCsv(fromDate, toDate), 'relatorio-financeiro.csv');
  }
}
