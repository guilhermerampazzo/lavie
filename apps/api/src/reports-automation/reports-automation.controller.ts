import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReportsAutomationService } from './reports-automation.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('reports/snapshot')
export class ReportsAutomationController {
  constructor(
    private readonly service: ReportsAutomationService,
    @InjectQueue('reports-automation') private readonly queue: Queue,
  ) {}

  @Get()
  getSnapshot() {
    return this.service.getSnapshot();
  }

  @Post('generate')
  generate() {
    return this.service.generateSnapshot();
  }

  @Post('enqueue')
  enqueue() {
    return this.queue.add('weekly-snapshot', {}, { removeOnComplete: 10, removeOnFail: 10 });
  }
}
