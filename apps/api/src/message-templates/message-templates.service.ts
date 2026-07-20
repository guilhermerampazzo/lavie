import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageTemplateDto, UpdateMessageTemplateDto } from './dto/message-template.dto';

@Injectable()
export class MessageTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.client.messageTemplate.findMany({ orderBy: { createdAt: 'asc' } });
  }

  create(dto: CreateMessageTemplateDto) {
    return this.prisma.client.messageTemplate.create({ data: dto });
  }

  async update(id: string, dto: UpdateMessageTemplateDto) {
    const existing = await this.prisma.client.messageTemplate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Template não encontrado');
    return this.prisma.client.messageTemplate.update({ where: { id }, data: dto });
  }
}
