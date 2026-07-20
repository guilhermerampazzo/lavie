import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WebhooksController } from './webhooks.controller';
import { WebhooksProcessor } from './webhooks.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'webhook-events' })],
  controllers: [WebhooksController],
  providers: [WebhooksProcessor],
})
export class WebhooksModule {}
