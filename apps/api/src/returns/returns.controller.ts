import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReturnsService } from './returns.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly service: ReturnsService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.service.list(status);
  }

  @Post(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: { status: 'solicitada' | 'aprovada' | 'recusada' | 'concluida' },
  ) {
    return this.service.updateStatus(id, body.status);
  }
}
