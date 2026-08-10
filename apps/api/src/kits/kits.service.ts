import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResellerKitDto } from './dto/reseller-kit.dto';

@Injectable()
export class KitsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.client.resellerKit.findMany({
      include: { items: { include: { product: { select: { id: true, nomeGerado: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const kit = await this.prisma.client.resellerKit.findUnique({
      where: { id },
      include: { items: { include: { product: { select: { id: true, nomeGerado: true } } } } },
    });
    if (!kit) throw new NotFoundException('Kit não encontrado');
    return kit;
  }

  async create(dto: CreateResellerKitDto) {
    const { items, ...kitData } = dto;
    return this.prisma.client.resellerKit.create({
      data: {
        ...kitData,
        items: { create: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) },
      },
      include: { items: true },
    });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.client.resellerKit.delete({ where: { id } });
  }
}
