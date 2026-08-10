import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  list(search?: string) {
    return this.prisma.client.supplier.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { document: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async get(id: string) {
    const supplier = await this.prisma.client.supplier.findUnique({
      where: { id },
      include: { products: { take: 5, orderBy: { createdAt: 'desc' } } },
    });
    if (!supplier) throw new NotFoundException('Fornecedor não encontrado');
    return supplier;
  }

  create(dto: CreateSupplierDto) {
    return this.prisma.client.supplier.create({ data: dto });
  }

  /** Busca por CNPJ — usado pelo fluxo de OCR (evita duplicar fornecedor). */
  async findByDocument(document: string) {
    return this.prisma.client.supplier.findFirst({ where: { document } });
  }

  /** Cria ou retorna fornecedor existente pelo CNPJ. */
  async upsertByDocument(dto: CreateSupplierDto) {
    if (dto.document) {
      const existing = await this.findByDocument(dto.document);
      if (existing) {
        return this.prisma.client.supplier.update({
          where: { id: existing.id },
          data: {
            name: dto.name || existing.name,
            code: dto.code ?? existing.code,
            phone: dto.phone ?? existing.phone,
          },
        });
      }
    }
    return this.create(dto);
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.get(id);
    return this.prisma.client.supplier.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.get(id);
    // Desvincula produtos (FK é SET NULL) antes de apagar
    await this.prisma.client.product.updateMany({
      where: { supplierId: id },
      data: { supplierId: null },
    });
    return this.prisma.client.supplier.delete({ where: { id } });
  }
}
