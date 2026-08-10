import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../common/decorators/current-user.decorator';
import { StockService } from './stock.service';
import { createStockMovementSchema } from './dto/stock-movement.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('stock')
export class StockController {
  constructor(private readonly service: StockService) {}

  @Get('movements')
  list(@Query('type') type?: string, @Query('variantId') variantId?: string) {
    return this.service.list({ type, variantId });
  }

  @Get('products/:productId/movements')
  listByProduct(@Param('productId') productId: string) {
    return this.service.listByProduct(productId);
  }

  @Post('movements')
  create(@CurrentUser() user: CurrentUserPayload, @Body() body: unknown) {
    return this.service.create(
      createStockMovementSchema.parse(body),
      user.userId,
    );
  }
}
