import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ProductsService } from './products.service';
import {
  analyzeImageSchema,
  createProductSchema,
  extractInvoiceSchema,
  updateProductSchema,
} from './dto/product.dto';

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
    @Query('supplierId') supplierId?: string,
  ) {
    return this.service.list({ status, categoryId, search, supplierId });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  /** Módulo 2 — análise de foto por IA (preenche a ficha). */
  @Post('analyze-image')
  analyzeImage(@Body() body: unknown) {
    return this.service.analyzeImage(analyzeImageSchema.parse(body));
  }

  /** Módulo 2 — extração de NF por IA (OCR). */
  @Post('extract-invoice')
  extractInvoice(@Body() body: unknown) {
    return this.service.extractInvoice(extractInvoiceSchema.parse(body));
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

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  /** Módulo 2 — dados para impressão de etiqueta. */
  @Get(':id/label')
  label(@Param('id') id: string) {
    return this.service.labelData(id);
  }
}
