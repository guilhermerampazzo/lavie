import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { NuvemshopModule } from './nuvemshop/nuvemshop.module';
import { ProductTemplatesModule } from './product-templates/product-templates.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CouponsModule } from './coupons/coupons.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { CustomersModule } from './customers/customers.module';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { ResellersModule } from './resellers/resellers.module';
import { OrdersModule } from './orders/orders.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PortalModule } from './portal/portal.module';
import { ReportsModule } from './reports/reports.module';
import { EvolutionModule } from './evolution/evolution.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessageTemplatesModule } from './message-templates/message-templates.module';
import { BlingModule } from './bling/bling.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = new URL(config.get<string>('REDIS_URL') ?? 'redis://redis:6379');
        return { connection: { host: url.hostname, port: Number(url.port || 6379) } };
      },
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    NuvemshopModule,
    ProductTemplatesModule,
    CategoriesModule,
    ProductsModule,
    CouponsModule,
    WebhooksModule,
    CustomersModule,
    AffiliatesModule,
    ResellersModule,
    OrdersModule,
    DashboardModule,
    PortalModule,
    ReportsModule,
    EvolutionModule,
    ConversationsModule,
    MessageTemplatesModule,
    BlingModule,
    SettingsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
