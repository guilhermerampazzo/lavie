import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReportsAutomationService } from './reports-automation.service';

@Processor('reports-automation')
export class ReportsAutomationProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportsAutomationProcessor.name);

  constructor(private readonly service: ReportsAutomationService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Job de relatório: ${job.name}`);
    if (job.name === 'weekly-snapshot') {
      return this.service.generateSnapshot();
    }
    return null;
  }
}
