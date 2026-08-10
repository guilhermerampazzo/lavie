import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EvolutionService } from './evolution.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('evolution')
export class EvolutionController {
  constructor(private readonly service: EvolutionService) {}

  @Get('status')
  status() {
    return this.service.status();
  }

  @Post('webhook')
  ensureWebhook() {
    return this.service.ensureWebhook();
  }

  @Post('pull-chats')
  pullChats() {
    return this.service.pullChats(25);
  }

  @Post('connect')
  connect() {
    return this.service.connect();
  }
}
