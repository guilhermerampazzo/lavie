import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { SyncService } from '../sync/sync.service';

const NUVEMSHOP_EVENT_ENTITY: Record<string, 'products' | 'customers' | 'orders'> = {
  'order/created': 'orders',
  'order/paid': 'orders',
  'order/updated': 'orders',
  'order/cancelled': 'orders',
  'order/fulfilled': 'orders',
  'product/created': 'products',
  'product/updated': 'products',
  'customer/created': 'customers',
  'customer/updated': 'customers',
};

interface EvolutionMessagePayload {
  event?: string;
  data?: {
    key?: { remoteJid?: string; fromMe?: boolean };
    message?: { conversation?: string; extendedTextMessage?: { text?: string } };
    pushName?: string;
  };
}

@Processor('webhook-events')
export class WebhooksProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhooksProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sync: SyncService,
  ) {
    super();
  }

  async process(job: Job<{ eventId: string }>) {
    const event = await this.prisma.client.webhookEvent.findUnique({ where: { id: job.data.eventId } });
    if (!event) return;

    this.logger.log(`Processando evento ${event.source}:${event.eventType} (${event.id})`);

    if (event.source === 'evolution') {
      await this.handleEvolutionEvent(event.payload as EvolutionMessagePayload);
    }

    if (event.source === 'nuvemshop') {
      const entity = NUVEMSHOP_EVENT_ENTITY[event.eventType];
      if (entity) {
        await this.sync.runEntity(entity);
      } else {
        this.logger.warn(`Evento Nuvemshop sem mapeamento: ${event.eventType}`);
      }
    }

    await this.prisma.client.webhookEvent.update({
      where: { id: event.id },
      data: { processed: true, processedAt: new Date() },
    });
  }

  private async handleEvolutionEvent(payload: EvolutionMessagePayload) {
    if (payload.event !== 'messages.upsert' || payload.data?.key?.fromMe) return;

    const remoteJid = payload.data?.key?.remoteJid;
    const text = payload.data?.message?.conversation ?? payload.data?.message?.extendedTextMessage?.text;
    if (!remoteJid || !text) return;

    const contact = remoteJid.split('@')[0];

    let conversation = await this.prisma.client.conversation.findFirst({
      where: { channel: 'whatsapp', contact },
    });
    if (!conversation) {
      conversation = await this.prisma.client.conversation.create({
        data: { channel: 'whatsapp', contact, status: 'aberta' },
      });
    } else {
      await this.prisma.client.conversation.update({
        where: { id: conversation.id },
        data: { status: 'aberta', updatedAt: new Date() },
      });
    }

    await this.prisma.client.message.create({
      data: { conversationId: conversation.id, direction: 'inbound', content: text },
    });
  }
}
