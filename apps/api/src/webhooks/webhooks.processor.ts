import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('webhook-events')
export class WebhooksProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhooksProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ eventId: string }>) {
    const event = await this.prisma.client.webhookEvent.findUnique({ where: { id: job.data.eventId } });
    if (!event) return;

    this.logger.log(`Processando evento ${event.source}:${event.eventType} (${event.id})`);

    // TODO: despachar por source/eventType conforme os fluxos forem implementados
    // (pedido criado/pago, produto atualizado, cliente criado — escopo.md 8.4).

    await this.prisma.client.webhookEvent.update({
      where: { id: event.id },
      data: { processed: true, processedAt: new Date() },
    });
  }
}
