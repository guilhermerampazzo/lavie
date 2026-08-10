import { Body, Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ChannelsService } from './channels.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly service: ChannelsService) {}

  @Get()
  list() {
    return this.service.listChannels();
  }

  @Post('products/:productId/publish')
  publish(@Param('productId') productId: string) {
    return this.service.publishProduct(productId);
  }
}
