import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CouponsService } from './coupons.service';
import { createCouponSchema, updateCouponSchema } from './dto/coupon.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.service.create(createCouponSchema.parse(body));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.service.update(id, updateCouponSchema.parse(body));
  }
}
