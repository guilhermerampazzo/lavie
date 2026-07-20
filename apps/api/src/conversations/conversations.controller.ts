import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ConversationsService } from './conversations.service';
import { sendMessageSchema, updateConversationSchema } from './dto/conversation.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly service: ConversationsService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.service.list(status);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.service.update(id, updateConversationSchema.parse(body));
  }

  @Post(':id/messages')
  sendMessage(@Param('id') id: string, @Body() body: unknown) {
    return this.service.sendMessage(id, sendMessageSchema.parse(body));
  }
}
