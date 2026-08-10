import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  list(status?: string) {
    return this.prisma.client.returnRequest.findMany({
      where: { status: status as never },
      include: {
        reseller: { select: { name: true } },
        order: { select: { id: true, total: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    status: 'solicitada' | 'aprovada' | 'recusada' | 'concluida',
  ) {
    const existing = await this.prisma.client.returnRequest.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Solicitação não encontrada');
    return this.prisma.client.returnRequest.update({
      where: { id },
      data: { status },
    });
  }
}
