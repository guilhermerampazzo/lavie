import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EvolutionService } from '../evolution/evolution.service';
import { SendMessageDto, UpdateConversationDto } from './dto/conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evolution: EvolutionService,
  ) {}

  list(status?: string) {
    return this.prisma.client.conversation.findMany({
      where: { status: status as never },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async get(id: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conversation) throw new NotFoundException('Conversa não encontrada');
    return conversation;
  }

  async update(id: string, dto: UpdateConversationDto) {
    await this.get(id);
    return this.prisma.client.conversation.update({ where: { id }, data: dto });
  }

  async sendMessage(conversationId: string, dto: SendMessageDto) {
    const conversation = await this.get(conversationId);

    if (this.evolution.configured && conversation.channel === 'whatsapp') {
      try {
        await this.evolution.client.messages.sendText(this.evolution.instanceName, {
          number: conversation.contact,
          text: dto.content,
        });
      } catch (err) {
        throw new BadRequestException(
          `Falha ao enviar mensagem via Evolution: ${(err as Error).message}`,
        );
      }
    }

    const message = await this.prisma.client.message.create({
      data: { conversationId, direction: 'outbound', content: dto.content },
    });

    await this.prisma.client.conversation.update({
      where: { id: conversationId },
      data: { status: 'em_atendimento' },
    });

    return message;
  }
}
