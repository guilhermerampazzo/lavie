import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

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

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ eventId: string }>) {
    const event = await this.prisma.client.webhookEvent.findUnique({ where: { id: job.data.eventId } });
    if (!event) return;

    this.logger.log(`Processando evento ${event.source}:${event.eventType} (${event.id})`);

    if (event.source === 'evolution') {
      await this.handleEvolutionEvent(event.payload as EvolutionMessagePayload);
    }

    // TODO: despachar eventos da Nuvemshop (pedido criado/pago, produto
    // atualizado, cliente criado) conforme os fluxos forem implementados —
    // escopo.md 8.4.

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
