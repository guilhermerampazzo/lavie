import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  /** Contas a receber/pagar com status calculado (atrasada quando venceu). */
  async list(type?: 'receivable' | 'payable', status?: string) {
    const accounts = await this.prisma.client.account.findMany({
      where: {
        type: type as never,
        status: status as never,
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    // Recalcula "atrasada" para contas abertas vencidas
    const now = new Date();
    const withRecalculated = accounts.map((a) => {
      if (a.status === 'aberta' && a.dueDate < now) {
        return { ...a, status: 'atrasada' as const };
      }
      return a;
    });
    return withRecalculated;
  }

  async get(id: string) {
    const account = await this.prisma.client.account.findUnique({
      where: { id },
    });
    if (!account) throw new NotFoundException('Conta não encontrada');
    return account;
  }

  create(dto: CreateAccountDto) {
    return this.prisma.client.account.create({
      data: {
        ...dto,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  async update(id: string, dto: UpdateAccountDto) {
    await this.get(id);
    return this.prisma.client.account.update({
      where: { id },
      data: {
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
        paidAt: dto.status === 'paga' ? new Date() : undefined,
      },
    });
  }

  /** Marca como paga e registra a data. */
  async markPaid(id: string) {
    await this.get(id);
    return this.prisma.client.account.update({
      where: { id },
      data: { status: 'paga', paidAt: new Date() },
    });
  }

  /** Fluxo de caixa: entradas e saídas previstas/realizadas por mês (6 meses). */
  async cashFlow() {
    const now = new Date();
    const months: Array<{
      month: string;
      receivables: number;
      payables: number;
      balance: number;
    }> = [];

    for (let i = 0; i < 6; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = start.toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      });

      const [receivables, payables] = await Promise.all([
        this.prisma.client.account.aggregate({
          where: { type: 'receivable', dueDate: { gte: start, lt: end } },
          _sum: { amount: true },
        }),
        this.prisma.client.account.aggregate({
          where: { type: 'payable', dueDate: { gte: start, lt: end } },
          _sum: { amount: true },
        }),
      ]);

      const receivablesTotal = Number(receivables._sum?.amount ?? 0);
      const payablesTotal = Number(payables._sum?.amount ?? 0);
      months.push({
        month: label,
        receivables: receivablesTotal,
        payables: payablesTotal,
        balance: receivablesTotal - payablesTotal,
      });
    }

    return months;
  }
}
