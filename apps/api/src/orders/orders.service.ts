import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  list(params: { status?: string; channel?: string }) {
    return this.prisma.client.order.findMany({
      where: {
        status: params.status as never,
        channel: params.channel as never,
      },
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const order = await this.prisma.client.order.findUnique({
      where: { id },
      include: { customer: true, items: { include: { product: true } } },
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
}
