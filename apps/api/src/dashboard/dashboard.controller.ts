import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('metrics')
  metrics(
    @Query('period') period?: 'today' | 'week' | 'month' | 'quarter' | 'year',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.metrics(period ?? 'month', from, to);
  }

  @Get('stock')
  stock() {
    return this.service.stock();
  }

  @Get('affiliate-ranking')
  affiliateRanking() {
    return this.service.affiliateRanking();
  }

  @Get('alerts')
  alerts() {
    return this.service.alerts();
  }
}
