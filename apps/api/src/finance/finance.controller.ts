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
import { FinanceService } from './finance.service';
import { createAccountSchema, updateAccountSchema } from './dto/account.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'equipe')
@Controller('finance')
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @Get('accounts')
  list(
    @Query('type') type?: 'receivable' | 'payable',
    @Query('status') status?: string,
  ) {
    return this.service.list(type, status);
  }

  @Get('cash-flow')
  cashFlow() {
    return this.service.cashFlow();
  }

  @Get('accounts/:id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post('accounts')
  create(@Body() body: unknown) {
    return this.service.create(createAccountSchema.parse(body));
  }

  @Put('accounts/:id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.service.update(id, updateAccountSchema.parse(body));
  }

  @Post('accounts/:id/paid')
  markPaid(@Param('id') id: string) {
    return this.service.markPaid(id);
  }
}
