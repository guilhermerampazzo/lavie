import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EvolutionService } from '../evolution/evolution.service';
import { AiService, AiClient } from '@lavie/ai';
import { SendMessageDto, UpdateConversationDto } from './dto/conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evolution: EvolutionService,
    private readonly ai: AiService,
  ) {}

  list(status?: string) {
    return this.prisma.client.conversation.findMany({
      where: { status: status as never },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * M7 — Identificação automática: busca o cliente pelo telefone da conversa
   * e devolve a ficha (segmentos, total gasto, último pedido) junto.
   */
  async get(id: string) {
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conversation) throw new NotFoundException('Conversa não encontrada');

    let customer: unknown = null;
    if (conversation.channel === 'whatsapp') {
      const digits = conversation.contact.replace(/\D/g, '');
      // aceita com ou sem 55/DDD
      const candidates = [digits, digits.replace(/^55/, ''), digits.slice(2)];
      const found = await this.prisma.client.customer.findFirst({
        where: { phone: { in: candidates } },
        include: {
          orders: { orderBy: { createdAt: 'desc' }, take: 1 },
          loyaltyPoints: true,
        },
      });
      if (found) {
        customer = {
          id: found.id,
          name: found.name,
          email: found.email,
          phone: found.phone,
          segments: found.segments,
          whatsappVip: found.whatsappVip,
          totalSpent: found.orders.length
            ? found.orders.reduce((s, o) => s + Number(o.total), 0)
            : 0,
          lastOrderAt: found.orders[0]?.createdAt ?? null,
          loyaltyPoints: found.loyaltyPoints?.points ?? 0,
        };
      }
    }

    return { ...conversation, customer };
  }

  async update(id: string, dto: UpdateConversationDto) {
    await this.get(id);
    return this.prisma.client.conversation.update({ where: { id }, data: dto });
  }

  /** Membros da equipe para transferência de conversa. */
  teamMembers() {
    return this.prisma.client.user.findMany({
      where: { role: { in: ['admin', 'equipe'] }, active: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * M7 — Sugestão de produtos por IA (escopofinal.md 8.2): usa o histórico da
   * conversa + a ficha do cliente (se identificado) + o catálogo ativo para
   * recomendar produtos. A IA escolhe DENTRO do catálogo real (nunca inventa).
   */
  async suggestProducts(conversationId: string) {
    const { messages, customer } = await this.get(conversationId);

    if (!this.ai.configured) {
      throw new BadRequestException(
        'IA não configurada — preencha AI_API_KEY (ou OPENCODE_GO_API_KEY) no .env.',
      );
    }

    const catalog = await this.prisma.client.product.findMany({
      where: { status: 'active' },
      include: { variants: true, category: true },
      take: 60,
    });

    const catalogBrief = catalog.map((p, i) => ({
      idx: i,
      nome: p.nomeGerado,
      tipo: p.tipoPeca ?? null,
      material: p.material ?? p.banhoMaterial ?? null,
      cor: p.corAcabamento ?? p.cor ?? null,
      categoria: p.category?.name ?? null,
      preco: Number(p.precoBase),
      estoque: p.variants.reduce((s, v) => s + v.estoque, 0),
    }));

    const transcript = messages
      .slice(-10)
      .map(
        (m) =>
          `${m.direction === 'inbound' ? 'Cliente' : 'Atendente'}: ${m.content}`,
      )
      .join('\n');

    const customerContext = customer
      ? `Cliente identificado: ${(customer as { name: string }).name}, segmentos ${(customer as { segments: string[] }).segments.join(', ') || 'nenhum'}, ticket total R$ ${(customer as { totalSpent: number }).totalSpent.toFixed(2)}`
      : 'Cliente não identificado ainda.';

    const prompt = `Você é o assistente de vendas da La Vie (joias e semijoias premium).

CONTEXTO DO CLIENTE:
${customerContext}

CONVERSA RECENTE:
${transcript || '(sem mensagens ainda)'}

CATÁLOGO DISPONÍVEL (índice, nome, tipo, material, cor, categoria, preço, estoque):
${catalogBrief.map((c) => `[${c.idx}] ${c.nome} | ${c.tipo ?? '-'} | ${c.material ?? '-'} | ${c.cor ?? '-'} | ${c.categoria ?? '-'} | R$ ${c.preco} | ${c.estoque} un`).join('\n')}

Com base na conversa e no perfil do cliente, recomende de 1 a 3 produtos do catálogo.

Responda APENAS com JSON:
{"recomendacoes": [{"idx": 0, "motivo": "frase curta de venda em pt-BR"}]}

Regras: escolha apenas índices que existem no catálogo (0 a ${catalogBrief.length - 1}); se não houver contexto suficiente, retorne {"recomendacoes": []}.`;

    const { content } = await this.ai.client.chatWithFallback(
      [
        {
          role: 'system',
          content: 'Você é um assistente de vendas de joalheria.',
        },
        { role: 'user', content: prompt },
      ],
      { jsonMode: true, temperature: 0.3 },
    );

    const parsed = AiClient.extractJson<{
      recomendacoes: Array<{ idx: number; motivo: string }>;
    }>(content);
    const recommendations = (parsed.recomendacoes ?? [])
      .filter((r) => catalog[r.idx])
      .slice(0, 3)
      .map((r) => ({
        product: {
          id: catalog[r.idx].id,
          nome: catalog[r.idx].nomeGerado,
          preco: Number(catalog[r.idx].precoBase),
          estoque: catalog[r.idx].variants.reduce((s, v) => s + v.estoque, 0),
        },
        motivo: r.motivo,
      }));

    return { recommendations, customer };
  }

  async sendMessage(conversationId: string, dto: SendMessageDto) {
    const conversation = await this.get(conversationId);

    if (this.evolution.configured && conversation.channel === 'whatsapp') {
      try {
        await this.evolution.client.messages.sendText(
          this.evolution.instanceName,
          {
            number: conversation.contact,
            text: dto.content,
          },
        );
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
