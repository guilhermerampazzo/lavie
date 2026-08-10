import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AutomationsService } from './automations.service';

@Processor('automations')
export class AutomationsProcessor extends WorkerHost {
  private readonly logger = new Logger(AutomationsProcessor.name);

  constructor(private readonly automations: AutomationsService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Job de automação: ${job.name}`);
    switch (job.name) {
      case 'welcome':
        return { sent: await this.automations.runWelcome() };
      case 'post-purchase':
        return { sent: await this.automations.runPostPurchase() };
      case 'birthday':
        return { sent: await this.automations.runBirthday() };
      case 'reactivation':
        return { sent: await this.automations.runReactivation() };
      case 'run-all':
      default:
        return this.automations.runAll();
    }
  }
}
