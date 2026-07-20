import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma } from '@lavie/db';
import { PrismaService } from '../prisma/prisma.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('webhook-events') private readonly queue: Queue,
  ) {}

  @Post(':source')
  @HttpCode(200)
  async receive(@Param('source') source: string, @Body() body: Record<string, unknown>) {
    const event = await this.prisma.client.webhookEvent.create({
      data: {
        source,
        eventType: (body?.event as string) ?? 'unknown',
        payload: (body ?? {}) as Prisma.InputJsonValue,
      },
    });

    await this.queue.add('process', { eventId: event.id }, { attempts: 5, backoff: { type: 'exponential', delay: 2000 } });

    return { received: true };
  }
}
