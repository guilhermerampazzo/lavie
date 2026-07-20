import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.client.category.findMany({ orderBy: { name: 'asc' } });
  }

  create(name: string, parentId?: string) {
    return this.prisma.client.category.create({ data: { name, parentId } });
  }
}
