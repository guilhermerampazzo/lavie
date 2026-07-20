import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AffiliatesService } from './affiliates.service';
import {
  createAffiliateSchema,
  updateAffiliateSchema,
  createTrackingLinkSchema,
  createCommissionSchema,
} from './dto/affiliate.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly service: AffiliatesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.service.create(createAffiliateSchema.parse(body));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.service.update(id, updateAffiliateSchema.parse(body));
  }

  @Post(':id/tracking-links')
  createTrackingLink(@Param('id') id: string, @Body() body: unknown) {
    return this.service.createTrackingLink(id, createTrackingLinkSchema.parse(body));
  }

  @Post(':id/commissions')
  createCommission(@Param('id') id: string, @Body() body: unknown) {
    return this.service.createCommission(id, createCommissionSchema.parse(body));
  }
}
