import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AutomationsService } from './automations.service';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('automations')
export class AutomationsController {
  constructor(
    private readonly automations: AutomationsService,
    private readonly prisma: PrismaService,
    @InjectQueue('automations') private readonly queue: Queue,
  ) {}

  /** Dispara todos os fluxos manualmente (teste / recuperação). */
  @Post('run')
  runAll() {
    return this.automations.runAll();
  }

  /** Dispara um fluxo específico. */
  @Post('run/:flow')
  runFlow(@Body() body: { flow?: string }) {
    const flow = body.flow ?? 'run-all';
    return this.queue.add(
      flow,
      {},
      { removeOnComplete: 1000, removeOnFail: 1000 },
    );
  }

  /** Últimos disparos registrados (auditoria do follow-up automático). */
  @Get('logs')
  logs() {
    return this.prisma.client.automationLog.findMany({
      take: 50,
      orderBy: { sentAt: 'desc' },
      include: { customer: { select: { name: true } } },
    });
  }
}
