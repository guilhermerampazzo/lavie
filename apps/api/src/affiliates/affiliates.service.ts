import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAffiliateDto,
  UpdateAffiliateDto,
  CreateTrackingLinkDto,
  CreateCommissionDto,
} from './dto/affiliate.dto';

@Injectable()
export class AffiliatesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const affiliates = await this.prisma.client.affiliate.findMany({
      include: { trackingLinks: true, commissions: { include: { order: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return affiliates
      .map((a) => {
        const conversions = a.trackingLinks.reduce((sum, l) => sum + l.conversions, 0);
        const revenue = a.commissions.reduce((sum, c) => sum + Number(c.order?.total ?? 0), 0);
        const commissionTotal = a.commissions.reduce((sum, c) => sum + Number(c.amount), 0);
        const commissionPending = a.commissions
          .filter((c) => c.status === 'pendente')
          .reduce((sum, c) => sum + Number(c.amount), 0);
        const roi = commissionTotal > 0 ? revenue / commissionTotal : null;
        return { ...a, conversions, revenue, commissionTotal, commissionPending, roi };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }

  async get(id: string) {
    const affiliate = await this.prisma.client.affiliate.findUnique({
      where: { id },
      include: {
        trackingLinks: true,
        commissions: { include: { order: true }, orderBy: { createdAt: 'desc' } },
        campaigns: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!affiliate) throw new NotFoundException('Afiliada não encontrada');
    return affiliate;
  }

  create(dto: CreateAffiliateDto) {
    return this.prisma.client.affiliate.create({ data: dto });
  }

  async update(id: string, dto: UpdateAffiliateDto) {
    await this.get(id);
    return this.prisma.client.affiliate.update({ where: { id }, data: dto });
  }

  async createTrackingLink(affiliateId: string, dto: CreateTrackingLinkDto) {
    await this.get(affiliateId);
    return this.prisma.client.trackingLink.create({ data: { affiliateId, ...dto } });
  }

  async createCommission(affiliateId: string, dto: CreateCommissionDto) {
    await this.get(affiliateId);
    return this.prisma.client.commission.create({
      data: { affiliateId, amount: dto.amount, orderId: dto.orderId, status: dto.status ?? 'pendente' },
    });
  }
}
