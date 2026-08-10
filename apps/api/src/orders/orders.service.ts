import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlingService } from '../bling/bling.service';
import { UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bling: BlingService,
  ) {}

  list(params: { status?: string; channel?: string }) {
    return this.prisma.client.order.findMany({
      where: {
        status: params.status as never,
        channel: params.channel as never,
      },
      include: { customer: true, items: true, invoice: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const order = await this.prisma.client.order.findUnique({
      where: { id },
      include: { customer: true, items: { include: { product: true } }, invoice: true },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.get(id);
    return this.prisma.client.order.update({
      where: { id },
      data: { status: dto.status, trackingCode: dto.trackingCode },
    });
  }

  /**
   * Emissão de NF-e (escopofinal.md 6.2): ao aprovar o envio, emite no Bling
   * se conectado. Sem Bling conectado, cria a Invoice como rascunho (a
   * operação emite depois manualmente) — nunca bloqueia o fluxo.
   */
  async emitInvoice(orderId: string) {
    const order = await this.get(orderId);

    const existing = await this.prisma.client.invoice.findUnique({ where: { orderId } });
    if (existing && existing.status === 'emitida') {
      return existing;
    }

    // Payload mínimo da NF-e v3 do Bling — ajustar aos campos reais quando
    // houver client_id/secret para testar (CLAUDE.md secao 3).
    const payload = {
      numero: existing?.number ?? undefined,
      dataEmissao: new Date().toISOString(),
      cliente: order.customer
        ? {
            nome: order.customer.name,
            email: order.customer.email ?? undefined,
            numeroDocumento: order.customer.document ?? undefined,
          }
        : undefined,
      itens: order.items.map((item) => ({
        codigo: item.sku,
        descricao: item.name,
        quantidade: item.quantity,
        valor: Number(item.unitPrice).toFixed(2),
      })),
    };

    let blingInvoiceId: string | undefined;
    let status: 'rascunho' | 'emitida' = 'rascunho';
    let number: string | undefined;
    let error: string | undefined;

    if (await this.bling.isConnected()) {
      try {
        const client = await this.bling.getClient();
        const result = (await client.invoices.create(payload)) as { id?: number | string; numero?: string | number };
        blingInvoiceId = result?.id != null ? String(result.id) : undefined;
        number = result?.numero != null ? String(result.numero) : undefined;
        status = 'emitida';
      } catch (err) {
        error = (err as Error).message.slice(0, 500);
      }
    }

    const data = {
      orderId,
      blingInvoiceId,
      number,
      status,
      total: order.total,
      error,
      issueDate: status === 'emitida' ? new Date() : undefined,
    };

    return existing
      ? this.prisma.client.invoice.update({ where: { orderId }, data })
      : this.prisma.client.invoice.create({ data });
  }
}
