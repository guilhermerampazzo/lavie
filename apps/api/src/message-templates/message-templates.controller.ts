import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MessageTemplatesService } from './message-templates.service';
import { createMessageTemplateSchema, updateMessageTemplateSchema } from './dto/message-template.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('message-templates')
export class MessageTemplatesController {
  constructor(private readonly service: MessageTemplatesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() body: unknown) {
    return this.service.create(createMessageTemplateSchema.parse(body));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.service.update(id, updateMessageTemplateSchema.parse(body));
  }
}
