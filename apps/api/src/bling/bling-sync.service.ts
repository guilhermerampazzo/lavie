import { Injectable, Logger } from '@nestjs/common';
import { BlingService } from './bling.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Sincroniza dados do Bling para o banco local, para que tudo fique
 * visível no painel sem precisar abrir o Bling (pedido da cliente).
 *
 * Modelo: cada "nota fiscal" vira um Invoice local; cada "conta" vira um
 * Account local (receivable/payable). Os ids externos do Bling são
 * preservados para não duplicar em sincronizações repetidas.
 */
interface BlingNota {
  id?: number | string;
  numero?: number | string;
  totalNota?: number | string;
  total?: number | string;
  status?: string;
  dataEmissao?: string;
}

interface BlingConta {
  id?: number | string;
  descricao?: string;
  valor?: number | string;
  valorOriginal?: number | string;
  dataVencimento?: string;
  dataPagamento?: string;
}

@Injectable()
export class BlingSyncService {
  private readonly logger = new Logger(BlingSyncService.name);
  /** Cache da validação (60s) — evita bater na API do Bling a cada request. */
  private validationCache: { at: number; result: { connected: boolean; error?: string | null } } | null = null;

  constructor(
    private readonly bling: BlingService,
    private readonly prisma: PrismaService,
  ) {}

  async isConnected(): Promise<boolean> {
    return this.bling.isConnected();
  }

  /** Valida o token atual com chamada real (com cache de 60s). */
  async validateConnection() {
    if (this.validationCache && Date.now() - this.validationCache.at < 60_000) {
      return this.validationCache.result;
    }
    let result: { connected: boolean; error?: string | null };
    if (!(await this.bling.isConnected())) {
      result = { connected: false, error: 'Sem token salvo (OAuth não concluído).' };
    } else {
      try {
        const client = await this.bling.getClient();
        const check = await client.validateToken();
        if (check.ok) {
          result = { connected: true, error: null };
        } else if (check.status === 401 || check.status === 403) {
          result = {
            connected: false,
            error:
              'Token do Bling expirado ou inválido — clique em "Conectar ao Bling" em /configuracoes para reconectar (a renovação automática não conseguiu atualizar).',
          };
        } else {
          result = { connected: false, error: check.error ?? 'Falha ao validar conexão com o Bling.' };
        }
      } catch (err) {
        result = { connected: false, error: (err as Error).message.slice(0, 300) };
      }
    }
    this.validationCache = { at: Date.now(), result };
    return result;
  }

  /** Puxa notas fiscais (NF-e emitidas) do Bling para a tabela Invoice. */
  async syncInvoices() {
    const client = await this.bling.getClient();
    const notas = (await client.invoices.list({ pagina: 1, limite: 50 })) as BlingNota[];

    let created = 0;
    for (const nota of notas) {
      const blingId = String(nota.id ?? nota.numero ?? '');
      if (!blingId) continue;

      const numero = String(nota.numero ?? '');
      const total = Number(nota.totalNota ?? nota.total ?? 0);
      const status = mapNotaStatus(nota.status);
      const issuedAt = nota.dataEmissao ? new Date(String(nota.dataEmissao).slice(0, 10)) : undefined;

      const existing = await this.prisma.client.invoice.findFirst({
        where: { blingInvoiceId: blingId },
      });

      const data = {
        blingInvoiceId: blingId,
        number: numero || undefined,
        status: status as never,
        total,
        issueDate: issuedAt,
      };

      if (existing) {
        await this.prisma.client.invoice.update({ where: { id: existing.id }, data });
      } else {
        await this.prisma.client.invoice.create({
          data: { ...data, orderId: null } as never,
        });
        created++;
      }
    }
    this.logger.log(`Bling sync: ${notas.length} notas fiscais, ${created} novas`);
    return { total: notas.length, created };
  }

  /** Puxa contas a receber para a tabela Account (type receivable). */
  async syncReceivables() {
    const client = await this.bling.getClient();
    const contas = (await client.receivables.list({ pagina: 1, limite: 100 })) as BlingConta[];

    let created = 0;
    for (const conta of contas) {
      const blingId = String(conta.id ?? '');
      if (!blingId) continue;

      const amount = Number(conta.valor ?? conta.valorOriginal ?? 0);
      const dueDate = conta.dataVencimento ? new Date(String(conta.dataVencimento).slice(0, 10)) : new Date();
      const paidAt = conta.dataPagamento ? new Date(String(conta.dataPagamento).slice(0, 10)) : undefined;
      const status = paidAt ? 'paga' : new Date() > dueDate ? 'atrasada' : 'aberta';

      const existing = await this.prisma.client.account.findFirst({
        where: { description: { contains: `Bling#${blingId}` } },
      });

      if (existing) {
        await this.prisma.client.account.update({
          where: { id: existing.id },
          data: { amount, dueDate, status: status as never, paidAt },
        });
      } else {
        await this.prisma.client.account.create({
          data: {
            type: 'receivable',
            description: `Bling#${blingId} ${conta.descricao ?? ''}`.trim(),
            amount,
            dueDate,
            status: status as never,
            paidAt,
          },
        });
        created++;
      }
    }
    this.logger.log(`Bling sync: ${contas.length} contas a receber, ${created} novas`);
    return { total: contas.length, created };
  }

  /** Puxa contas a pagar para a tabela Account (type payable). */
  async syncPayables() {
    const client = await this.bling.getClient();
    const contas = (await client.payables.list({ pagina: 1, limite: 100 })) as BlingConta[];

    let created = 0;
    for (const conta of contas) {
      const blingId = String(conta.id ?? '');
      if (!blingId) continue;

      const amount = Number(conta.valor ?? conta.valorOriginal ?? 0);
      const dueDate = conta.dataVencimento ? new Date(String(conta.dataVencimento).slice(0, 10)) : new Date();
      const paidAt = conta.dataPagamento ? new Date(String(conta.dataPagamento).slice(0, 10)) : undefined;
      const status = paidAt ? 'paga' : new Date() > dueDate ? 'atrasada' : 'aberta';

      const existing = await this.prisma.client.account.findFirst({
        where: { description: { contains: `Bling#${blingId}` } },
      });

      if (existing) {
        await this.prisma.client.account.update({
          where: { id: existing.id },
          data: { amount, dueDate, status: status as never, paidAt },
        });
      } else {
        await this.prisma.client.account.create({
          data: {
            type: 'payable',
            description: `Bling#${blingId} ${conta.descricao ?? ''}`.trim(),
            amount,
            dueDate,
            status: status as never,
            paidAt,
          },
        });
        created++;
      }
    }
    this.logger.log(`Bling sync: ${contas.length} contas a pagar, ${created} novas`);
    return { total: contas.length, created };
  }

  /** Sincroniza tudo que o Bling expõe. */
  async syncAll() {
    if (!(await this.isConnected())) {
      return { error: 'Bling não conectado. Clique em "Conectar ao Bling" em /configuracoes.' };
    }
    const [invoices, receivables, payables] = await Promise.all([
      this.syncInvoices(),
      this.syncReceivables(),
      this.syncPayables(),
    ]);
    return { invoices, receivables, payables };
  }

  /** Dados consolidados para a tela do painel. */
  async dashboard() {
    const [invoices, receivables, payables] = await Promise.all([
      this.prisma.client.invoice.findMany({ orderBy: { issueDate: 'desc' }, take: 20 }),
      this.prisma.client.account.findMany({ where: { type: 'receivable' }, orderBy: { dueDate: 'asc' } }),
      this.prisma.client.account.findMany({ where: { type: 'payable' }, orderBy: { dueDate: 'asc' } }),
    ]);

    const receivablesOpen = receivables
      .filter((a) => a.status !== 'paga')
      .reduce((s, a) => s + Number(a.amount), 0);
    const payablesOpen = payables.filter((a) => a.status !== 'paga').reduce((s, a) => s + Number(a.amount), 0);

    return {
      connection: await this.validateConnection(),
      invoices: {
        total: invoices.length,
        emitted: invoices.filter((i) => i.status === 'emitida').length,
        drafts: invoices.filter((i) => i.status === 'rascunho').length,
        items: invoices,
      },
      receivables: { totalOpen: receivablesOpen, items: receivables.slice(0, 20) },
      payables: { totalOpen: payablesOpen, items: payables.slice(0, 20) },
      summary: {
        aReceber: receivablesOpen,
        aPagar: payablesOpen,
        saldoPrevisto: receivablesOpen - payablesOpen,
      },
    };
  }
}

function mapNotaStatus(status: unknown): 'rascunho' | 'emitida' | 'cancelada' {
  const s = typeof status === 'string' ? status.toLowerCase() : '';
  if (s.includes('cancel')) return 'cancelada';
  if (s.includes('emiss') || s.includes('autoriz')) return 'emitida';
  return 'rascunho';
}
