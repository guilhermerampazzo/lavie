import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReportsAutomationController } from './reports-automation.controller';
import { ReportsAutomationService } from './reports-automation.service';
import { ReportsAutomationProcessor } from './reports-automation.processor';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [ReportsModule, BullModule.registerQueue({ name: 'reports-automation' })],
  controllers: [ReportsAutomationController],
  providers: [ReportsAutomationService, ReportsAutomationProcessor],
})
export class ReportsAutomationModule implements OnModuleInit {
  constructor(@InjectQueue('reports-automation') private readonly queue: Queue) {}

  /** Gera snapshot semanal (segunda-feira 07:00). */
  async onModuleInit() {
    await this.queue.upsertJobScheduler(
      'reports-weekly',
      { pattern: '0 7 * * 1' },
      { name: 'weekly-snapshot', opts: { removeOnComplete: 10, removeOnFail: 10 } },
    );
  }
}
