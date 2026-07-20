import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { SyncService } from './sync.service';

export interface SyncJobData {
  syncJobId: string;
  entity: 'products' | 'customers' | 'orders' | 'coupons';
}

@Processor('sync-jobs')
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sync: SyncService,
  ) {
    super();
  }

  async process(job: Job<SyncJobData>) {
    const { syncJobId, entity } = job.data;

    await this.prisma.client.syncJob.update({
      where: { id: syncJobId },
      data: { status: 'running', startedAt: new Date() },
    });

    try {
      const count = await this.sync.runEntity(entity);
      await this.prisma.client.syncJob.update({
        where: { id: syncJobId },
        data: { status: 'success', finishedAt: new Date(), error: `${count} registro(s) sincronizado(s)` },
      });
    } catch (err) {
      this.logger.error(`Sync ${entity} falhou: ${(err as Error).message}`);
      await this.prisma.client.syncJob.update({
        where: { id: syncJobId },
        data: { status: 'failed', finishedAt: new Date(), error: (err as Error).message },
      });
    }
  }
}
