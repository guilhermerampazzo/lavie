import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { PortalService } from './portal.service';
import { createPortalOrderSchema } from './dto/portal-order.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('revendedora')
@Controller('portal')
export class PortalController {
  constructor(private readonly service: PortalService) {}

  @Get('catalog')
  catalog(@CurrentUser() user: CurrentUserPayload) {
    return this.service.catalog(user.resellerId);
  }

  @Get('orders')
  orders(@CurrentUser() user: CurrentUserPayload) {
    return this.service.orders(user.resellerId);
  }

  @Post('orders')
  createOrder(@CurrentUser() user: CurrentUserPayload, @Body() body: unknown) {
    return this.service.createOrder(user.resellerId, createPortalOrderSchema.parse(body));
  }

  @Get('price-table')
  priceTable(@CurrentUser() user: CurrentUserPayload) {
    return this.service.priceTable(user.resellerId);
  }
}
