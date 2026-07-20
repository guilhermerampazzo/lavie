import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResellerDto, UpdateResellerDto } from './dto/reseller.dto';

@Injectable()
export class ResellersService {
  constructor(private readonly prisma: PrismaService) {}

  list(status?: string) {
    return this.prisma.client.reseller.findMany({
      where: { status: status as never },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const reseller = await this.prisma.client.reseller.findUnique({
      where: { id },
      include: {
        priceTable: true,
        consignments: true,
        orders: { include: { order: true } },
        documents: true,
      },
    });
    if (!reseller) throw new NotFoundException('Revendedora não encontrada');
    return reseller;
  }

  create(dto: CreateResellerDto) {
    return this.prisma.client.reseller.create({ data: dto });
  }

  async update(id: string, dto: UpdateResellerDto) {
    await this.get(id);
    return this.prisma.client.reseller.update({ where: { id }, data: dto });
  }

  async approve(id: string) {
    await this.get(id);
    return this.prisma.client.reseller.update({ where: { id }, data: { status: 'aprovada' } });
  }

  async block(id: string) {
    await this.get(id);
    return this.prisma.client.reseller.update({ where: { id }, data: { status: 'bloqueada' } });
  }

  async invite(id: string, email: string) {
    const reseller = await this.prisma.client.reseller.findUnique({ where: { id } });
    if (!reseller) throw new NotFoundException('Revendedora não encontrada');
    if (reseller.status !== 'aprovada') {
      throw new BadRequestException('Só é possível liberar acesso para revendedoras aprovadas.');
    }

    const existing = await this.prisma.client.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Já existe um usuário com esse e-mail.');

    const tempPassword = randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.client.user.create({
      data: {
        name: reseller.name,
        email,
        passwordHash,
        role: 'revendedora',
        resellerId: reseller.id,
      },
    });

    return { user: { id: user.id, name: user.name, email: user.email }, tempPassword };
  }
}
