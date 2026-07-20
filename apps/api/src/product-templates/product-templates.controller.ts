import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ProductTemplatesService } from './product-templates.service';
import { createProductTemplateSchema, updateProductTemplateSchema } from './dto/product-template.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product-templates')
export class ProductTemplatesController {
  constructor(private readonly service: ProductTemplatesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Roles('admin', 'equipe')
  @Post()
  create(@Body() body: unknown) {
    return this.service.create(createProductTemplateSchema.parse(body));
  }

  @Roles('admin', 'equipe')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.service.update(id, updateProductTemplateSchema.parse(body));
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
