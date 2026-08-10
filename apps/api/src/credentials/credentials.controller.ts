import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CredentialsService } from './credentials.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('settings/credentials')
export class CredentialsController {
  constructor(private readonly service: CredentialsService) {}

  @Get()
  status() {
    return this.service.getStatus();
  }

  @Put(':channel')
  save(
    @Param('channel') channel: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.save(channel as never, body ?? {});
  }

  @Delete(':channel')
  remove(@Param('channel') channel: string) {
    return this.service.remove(channel);
  }
}
