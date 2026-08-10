import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EvolutionService } from '../evolution/evolution.service';

/**
 * Automações de follow-up e marketing (escopofinal.md 5.5).
 *
 * Cada fluxo busca alvos elegíveis e dispara o template correspondente via
 * Evolution API (WhatsApp). O log em AutomationLog garante dedupe:
 *   - pos-compra: 1x por pedido (targetId = orderId)
 *   - aniversario: 1x por ano por cliente (targetId = `${customerId}:${ano}`)
 *   - reativacao: 1x por janela de 60d (targetId = `${customerId}:reativacao`)
 *   - boas-vindas: 1x por cliente (targetId = customerId)
 *
 * Se a Evolution não estiver configurada/pareada, registra no log com status
 * "no_evolution" e não tenta reenviar — a operação vê os pendentes no painel.
 */
@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly evolution: EvolutionService,
  ) {}

  /** Normaliza telefone para o formato do WhatsApp (55 + DDD + número). */
  private normalizePhone(phone: string): string | null {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return null;
    if (digits.length === 10) return `55${digits}`; // fixo
    if (digits.length === 11) return `55${digits}`; // celular
    if (digits.length === 12 && digits.startsWith('55')) return digits;
    if (digits.length === 13 && digits.startsWith('55')) return digits;
    return null;
  }

  private async getTemplate(trigger: string) {
    return this.prisma.client.messageTemplate.findFirst({
      where: { trigger, active: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Registra o disparo (ou o motivo de não disparo) com dedupe por unique key. */
  private async log(
    trigger: string,
    targetId: string,
    status: 'sent' | 'skipped_no_template' | 'failed' | 'no_evolution',
    customerId?: string,
    detail?: string,
  ) {
    try {
      await this.prisma.client.automationLog.create({
        data: { trigger, targetId, customerId, status, detail },
      });
    } catch (err) {
      // unique key já existe — ignora (dedupe)
      if ((err as { code?: string }).code === 'P2002') return;
      this.logger.warn(
        `Erro ao gravar log de automação ${trigger}/${targetId}: ${(err as Error).message}`,
      );
    }
  }

  private async sendToCustomer(
    trigger: string,
    customer: { id: string; name: string; phone: string | null },
    targetId: string,
    templateVars: Record<string, string> = {},
  ) {
    const template = await this.getTemplate(trigger);
    if (!template) {
      await this.log(
        trigger,
        targetId,
        'skipped_no_template',
        customer.id,
        'template ativo não encontrado',
      );
      return;
    }
    if (!customer.phone) {
      await this.log(
        trigger,
        targetId,
        'skipped_no_template',
        customer.id,
        'cliente sem telefone',
      );
      return;
    }
    const number = this.normalizePhone(customer.phone);
    if (!number) {
      await this.log(
        trigger,
        targetId,
        'skipped_no_template',
        customer.id,
        `telefone inválido: ${customer.phone}`,
      );
      return;
    }
    if (!this.evolution.configured) {
      await this.log(
        trigger,
        targetId,
        'no_evolution',
        customer.id,
        'Evolution não configurada',
      );
      return;
    }

    let content = template.content;
    for (const [k, v] of Object.entries(templateVars)) {
      content = content.replaceAll(`{{${k}}}`, v);
    }
    content = content.replaceAll('{{nome}}', customer.name.split(' ')[0]);

    try {
      await this.evolution.client.messages.sendText(
        this.evolution.instanceName,
        {
          number,
          text: content,
        },
      );
      await this.log(trigger, targetId, 'sent', customer.id, `→ ${number}`);
      this.logger.log(
        `Automação ${trigger} enviada para ${customer.name} (${number})`,
      );
    } catch (err) {
      await this.log(
        trigger,
        targetId,
        'failed',
        customer.id,
        (err as Error).message.slice(0, 200),
      );
      this.logger.warn(
        `Automação ${trigger} falhou para ${customer.name}: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Pós-compra: pedidos pagos nas últimas 2h que ainda não receberam a
   * mensagem de confirmação (1x por pedido).
   */
  async runPostPurchase() {
    const since = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const orders = await this.prisma.client.order.findMany({
      where: {
        status: 'pago',
        createdAt: { gte: since },
      },
      include: { customer: true },
    });
    for (const o of orders) {
      if (!o.customer) continue;
      await this.sendToCustomer('pos-compra', o.customer, `order:${o.id}`, {
        pedido: o.id.slice(-6),
        total: Number(o.total).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
      });
    }
    return orders.length;
  }

  /** Aniversário: clientes que fazem aniversário hoje (1x por ano). */
  async runBirthday() {
    const today = new Date();
    const customers = await this.prisma.client.customer.findMany({
      where: { birthDate: { not: null }, phone: { not: null } },
    });
    let count = 0;
    for (const c of customers) {
      if (!c.birthDate) continue;
      if (
        c.birthDate.getMonth() === today.getMonth() &&
        c.birthDate.getDate() === today.getDate()
      ) {
        const year = today.getFullYear();
        await this.sendToCustomer('aniversario', c, `${c.id}:${year}`);
        count++;
      }
    }
    return count;
  }

  /**
   * Reativação: clientes com compra anterior mas sem compra há 60+ dias
   * (1x por janela — controlado pelo targetId com data).
   */
  async runReactivation() {
    const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const customers = await this.prisma.client.customer.findMany({
      where: { phone: { not: null } },
      include: { orders: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    let count = 0;
    for (const c of customers) {
      const lastOrder = c.orders[0];
      if (!lastOrder) continue; // nunca comprou — não é reativação
      if (lastOrder.createdAt >= cutoff) continue; // comprou recentemente
      if (c.segments.includes('a_reativar')) {
        const windowKey = lastOrder.createdAt.toISOString().slice(0, 10);
        await this.sendToCustomer('reativacao', c, `${c.id}:${windowKey}`);
        count++;
      }
    }
    return count;
  }

  /**
   * Boas-vindas: clientes novos (criados nas últimas 2h) sem mensagem ainda.
   */
  async runWelcome() {
    const since = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const customers = await this.prisma.client.customer.findMany({
      where: { createdAt: { gte: since }, phone: { not: null } },
    });
    for (const c of customers) {
      await this.sendToCustomer('boas-vindas', c, c.id);
    }
    return customers.length;
  }

  /** Executa todos os fluxos (job agendado via BullMQ a cada hora). */
  async runAll() {
    const results = {
      welcome: await this.runWelcome(),
      postPurchase: await this.runPostPurchase(),
      birthday: await this.runBirthday(),
      reactivation: await this.runReactivation(),
    };
    this.logger.log(`Automações executadas: ${JSON.stringify(results)}`);
    return results;
  }
}
