import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AutomationsController } from './automations.controller';
import { AutomationsService } from './automations.service';
import { AutomationsProcessor } from './automations.processor';
import { EvolutionModule } from '../evolution/evolution.module';

@Module({
  imports: [EvolutionModule, BullModule.registerQueue({ name: 'automations' })],
  controllers: [AutomationsController],
  providers: [AutomationsService, AutomationsProcessor],
})
export class AutomationsModule implements OnModuleInit {
  constructor(@InjectQueue('automations') private readonly queue: Queue) {}

  /**
   * Agenda a execução de todos os fluxos a cada hora. O repeatable job é
   * idempotente no BullMQ (mesmo jobId não duplica).
   */
  async onModuleInit() {
    await this.queue.upsertJobScheduler(
      'automations-hourly',
      { every: 60 * 60 * 1000 },
      { name: 'run-all', opts: { removeOnComplete: 1000, removeOnFail: 1000 } },
    );
  }
}
