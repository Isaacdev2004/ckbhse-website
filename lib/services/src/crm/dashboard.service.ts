import type { DataLayer } from '@workspace/data';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import { isOpenLeadStatus } from '@workspace/domain/crm';

export interface DashboardMetrics {
  readonly newLeads: number;
  readonly qualified: number;
  readonly won: number;
  readonly lost: number;
  readonly openLeads: number;
  readonly averageResponseMinutes: number | null;
}

export class DashboardService {
  constructor(private readonly dataLayer: DataLayer) {}

  async getMetrics(context: AuthorizationContext): Promise<DashboardMetrics> {
    const page = await this.dataLayer.leadRepository.search(
      context,
      {},
      { kind: 'offset', offset: 0, limit: 10_000 },
    );

    const items = page.items;
    const newLeads = items.filter((l) => l.status === 'new').length;
    const qualified = items.filter((l) => l.status === 'qualified').length;
    const won = items.filter((l) => l.status === 'won').length;
    const lost = items.filter((l) => l.status === 'lost').length;
    const openLeads = items.filter((l) => isOpenLeadStatus(l.status)).length;

    const acknowledged = items.filter(
      (l) => l.status !== 'new' && l.createdAt !== l.updatedAt,
    );
    const responseTimes = acknowledged.map(
      (l) => (l.updatedAt.getTime() - l.createdAt.getTime()) / 60_000,
    );
    const averageResponseMinutes =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((sum, value) => sum + value, 0) /
              responseTimes.length,
          )
        : null;

    return {
      newLeads,
      qualified,
      won,
      lost,
      openLeads,
      averageResponseMinutes,
    };
  }
}
