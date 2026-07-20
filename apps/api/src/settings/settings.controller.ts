import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { z } from 'zod';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { NuvemshopService } from '../nuvemshop/nuvemshop.service';
import { BlingService } from '../bling/bling.service';
import { EvolutionService } from '../evolution/evolution.service';
import { PrismaService } from '../prisma/prisma.service';
import type { SyncJobData } from '../sync/sync.processor';

const syncEntitySchema = z.object({
  entity: z.enum(['products', 'customers', 'orders', 'coupons', 'all']),
});

const SYNC_ENTITIES = ['products', 'customers', 'orders', 'coupons'] as const;

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly nuvemshop: NuvemshopService,
    private readonly bling: BlingService,
    private readonly evolution: EvolutionService,
    private readonly prisma: PrismaService,
    @InjectQueue('sync-jobs') private readonly syncQueue: Queue<SyncJobData>,
  ) {}

  @Get('integrations')
  async integrations() {
    return {
      nuvemshop: { configured: this.nuvemshop.configured, label: 'Nuvemshop' },
      bling: {
        configured: await this.bling.isConnected(),
        canConnect: this.bling.hasClientCredentials(),
        label: 'Bling (fiscal/financeiro)',
      },
      evolution: { configured: this.evolution.configured, label: 'Evolution API (WhatsApp)' },
    };
  }

  @Get('sync-jobs')
  syncJobs() {
    return this.prisma.client.syncJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  @Post('webhooks/register')
  async registerWebhooks() {
    return this.nuvemshop.registerWebhooks();
  }

  @Post('sync')
  async triggerSync(@Body() body: unknown) {
    const { entity } = syncEntitySchema.parse(body);
    const entities = entity === 'all' ? SYNC_ENTITIES : [entity];

    const jobs: Awaited<ReturnType<typeof this.prisma.client.syncJob.create>>[] = [];
    for (const e of entities) {
      const syncJob = await this.prisma.client.syncJob.create({
        data: { type: `nuvemshop:${e}`, status: 'pending' },
      });
      await this.syncQueue.add('sync', { syncJobId: syncJob.id, entity: e });
      jobs.push(syncJob);
    }
    return jobs;
  }
}
