import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductTemplateDto, UpdateProductTemplateDto } from './dto/product-template.dto';

@Injectable()
export class ProductTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.client.productTemplate.findMany({ orderBy: { name: 'asc' } });
  }

  async get(id: string) {
    const template = await this.prisma.client.productTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Template não encontrado');
    return template;
  }

  create(dto: CreateProductTemplateDto) {
    return this.prisma.client.productTemplate.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductTemplateDto) {
    await this.get(id);
    return this.prisma.client.productTemplate.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.get(id);
    await this.prisma.client.productTemplate.delete({ where: { id } });
  }
}
