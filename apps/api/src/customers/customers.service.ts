import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeSegments } from './segmentation';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private async withSegments<T extends { id: string; createdAt: Date; birthDate: Date | null }>(
    customer: T,
  ) {
    const orders = await this.prisma.client.order.findMany({
      where: { customerId: customer.id },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const ordersCount = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const lastOrderAt = orders[0]?.createdAt ?? null;

    const segments = computeSegments({
      ordersCount,
      totalSpent,
      lastOrderAt,
      createdAt: customer.createdAt,
      birthDate: customer.birthDate,
    });

    return { ...customer, segments, ordersCount, totalSpent };
  }

  async list(params: { segment?: string; search?: string }) {
    const customers = await this.prisma.client.customer.findMany({
      where: {
        name: params.search ? { contains: params.search, mode: 'insensitive' } : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await Promise.all(customers.map((c) => this.withSegments(c)));
    return params.segment
      ? enriched.filter((c) => c.segments.includes(params.segment as never))
      : enriched;
  }

  async get(id: string) {
    const customer = await this.prisma.client.customer.findUnique({
      where: { id },
      include: {
        loyaltyPoints: true,
        orders: { include: { items: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    return this.withSegments(customer);
  }

  create(dto: CreateCustomerDto) {
    return this.prisma.client.customer.create({
      data: { ...dto, birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined },
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const existing = await this.prisma.client.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Cliente não encontrado');
    return this.prisma.client.customer.update({
      where: { id },
      data: { ...dto, birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined },
    });
  }
}
