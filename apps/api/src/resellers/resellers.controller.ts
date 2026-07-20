import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResellersService } from './resellers.service';
import { createResellerSchema, updateResellerSchema, inviteResellerSchema } from './dto/reseller.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('resellers')
export class ResellersController {
  constructor(private readonly service: ResellersService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.service.list(status);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.service.create(createResellerSchema.parse(body));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.service.update(id, updateResellerSchema.parse(body));
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @Post(':id/block')
  block(@Param('id') id: string) {
    return this.service.block(id);
  }

  @Post(':id/invite')
  invite(@Param('id') id: string, @Body() body: unknown) {
    const { email } = inviteResellerSchema.parse(body);
    return this.service.invite(id, email);
  }
}
