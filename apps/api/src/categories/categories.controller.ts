import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CategoriesService } from './categories.service';

const createCategorySchema = z.object({ name: z.string().min(1), parentId: z.string().optional() });

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() body: unknown) {
    const dto = createCategorySchema.parse(body);
    return this.service.create(dto.name, dto.parentId);
  }
}
