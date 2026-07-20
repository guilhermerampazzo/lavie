import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { createProductSchema, updateProductSchema } from './dto/product.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.service.list({ status, categoryId, search });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.service.create(createProductSchema.parse(body));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.service.update(id, updateProductSchema.parse(body));
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }
}
