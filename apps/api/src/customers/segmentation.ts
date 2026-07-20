export interface SegmentationInput {
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: Date | null;
  createdAt: Date;
  birthDate: Date | null;
}

export interface SegmentationThresholds {
  vipTotalSpent: number;
  vipOrdersCount: number;
  fielOrdersCount: number;
  novoDias: number;
  reativarDias: number;
  aniversarioJanelaDias: number;
}

export const DEFAULT_SEGMENTATION_THRESHOLDS: SegmentationThresholds = {
  vipTotalSpent: 2000,
  vipOrdersCount: 10,
  fielOrdersCount: 5,
  novoDias: 30,
  reativarDias: 90,
  aniversarioJanelaDias: 7,
};

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function isBirthdayWithinWindow(birthDate: Date, now: Date, windowDays: number): boolean {
  const thisYear = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  const diff = daysBetween(thisYear, now);
  if (diff >= 0 && diff <= windowDays) return true;
  const nextYear = new Date(now.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  const diffNext = daysBetween(nextYear, now);
  return diffNext >= 0 && diffNext <= windowDays;
}

/**
 * Segmentacao automatica — escopo.md secao 3/6.
 * "Carrinho abandonado" nao e computado aqui: depende de eventos de carrinho
 * da Nuvemshop que ainda nao sao capturados (fica para quando os webhooks
 * de carrinho existirem).
 */
export function computeSegments(
  input: SegmentationInput,
  thresholds: SegmentationThresholds = DEFAULT_SEGMENTATION_THRESHOLDS,
  now: Date = new Date(),
): Array<'vip' | 'fiel' | 'novo' | 'a_reativar' | 'aniversariante'> {
  const segments: Array<'vip' | 'fiel' | 'novo' | 'a_reativar' | 'aniversariante'> = [];

  if (input.totalSpent >= thresholds.vipTotalSpent || input.ordersCount >= thresholds.vipOrdersCount) {
    segments.push('vip');
  } else if (input.ordersCount >= thresholds.fielOrdersCount) {
    segments.push('fiel');
  }

  if (input.ordersCount <= 1 && daysBetween(now, input.createdAt) <= thresholds.novoDias) {
    segments.push('novo');
  }

  if (input.lastOrderAt && daysBetween(now, input.lastOrderAt) >= thresholds.reativarDias) {
    segments.push('a_reativar');
  }

  if (input.birthDate && isBirthdayWithinWindow(input.birthDate, now, thresholds.aniversarioJanelaDias)) {
    segments.push('aniversariante');
  }

  return segments;
}
