import { describe, expect, it, vi } from 'vitest';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { InspectionService, ComplianceScoreService } from './index.js';

const ctx = {
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: 'user-1',
  permissions: new Set([
    PERMISSIONS.INSPECTION_READ,
    PERMISSIONS.INSPECTION_CREATE,
    PERMISSIONS.COMPLIANCE_READ,
  ]),
  roles: new Set<string>(),
} as const;

describe('InspectionService', () => {
  it('creates inspection in draft status', async () => {
    const inspection = {
      create: vi.fn(async (_c: unknown, input: unknown) => ({ id: 'i1', ...(input as object) })),
      listTypes: vi.fn(async () => []),
      list: vi.fn(async () => []),
      get: vi.fn(async () => null),
      dashboardCounts: vi.fn(async () => ({ total: 0 })),
      listToday: vi.fn(async () => []),
      listUpcoming: vi.fn(async () => []),
    };
    const service = new InspectionService(inspection as never);
    await service.create(ctx as never, { name: 'Fire Safety Walk' });
    expect(inspection.create).toHaveBeenCalled();
  });

  it('throws when inspection not found', async () => {
    const inspection = {
      get: vi.fn(async () => null),
      listFindings: vi.fn(),
      listEvidence: vi.fn(),
      listChecklist: vi.fn(),
    };
    const service = new InspectionService(inspection as never);
    await expect(service.get(ctx as never, 'missing')).rejects.toThrow(AppError);
  });
});

describe('ComplianceScoreService', () => {
  it('calculates weighted organisation score from config', async () => {
    const compliance = {
      listScoreConfigs: vi.fn(async () => [
        { weights: { audit: 50, inspection: 50, training: 0, legal: 0, controls: 0 } },
      ]),
    };
    const inspection = {
      dashboardCounts: vi.fn(async () => ({ averageScore: 80 })),
    };
    const audit = {
      dashboardCounts: vi.fn(async () => ({ averageScore: 90 })),
    };
    const service = new ComplianceScoreService(
      compliance as never,
      inspection as never,
      audit as never,
    );
    const result = await service.calculate(ctx as never);
    expect(result.organizationScore).toBe(85);
  });
});

describe('ComplianceService dashboard', () => {
  it('includes capa completion from capa repository counts', async () => {
    const score = {
      calculate: vi.fn(async () => ({ organizationScore: 80 })),
    };
    const repos = {
      audit: { dashboardCounts: vi.fn(async () => ({ total: 4, closed: 2 })) },
      inspection: {
        dashboardCounts: vi.fn(async () => ({ total: 4, completed: 2, passed: 1 })),
      },
      capa: { dashboardCounts: vi.fn(async () => ({ total: 4, closed: 3 })) },
      compliance: { listIsoFrameworks: vi.fn(async () => []) },
      legal: { list: vi.fn(async () => []) },
      control: { list: vi.fn(async () => []) },
      calendar: { list: vi.fn(async () => []) },
    };
    const { ComplianceService } = await import('./index.js');
    const service = new ComplianceService(repos as never, score as never);
    const dashboard = await service.getDashboard(ctx as never);
    expect(dashboard.widgets.capaCompletion).toBe(75);
  });

  it('includes analytics widgets when analytics repository is wired', async () => {
    const score = {
      calculate: vi.fn(async () => ({ organizationScore: 80 })),
    };
    const analytics = {
      listKpiSnapshots: vi.fn(async () => [
        { snapshotMonth: '2026-06', complianceScore: 80, auditCompletion: 50 },
      ]),
      controlEffectiveness: vi.fn(async () => ({ effectivenessRate: 90 })),
      listAlerts: vi.fn(async () => [
        { alertType: 'legal_review', status: 'open' },
        { alertType: 'regulation_change', status: 'open' },
      ]),
    };
    const repos = {
      audit: { dashboardCounts: vi.fn(async () => ({ total: 4, closed: 2 })) },
      inspection: {
        dashboardCounts: vi.fn(async () => ({ total: 4, completed: 2, passed: 1 })),
      },
      capa: { dashboardCounts: vi.fn(async () => ({ total: 4, closed: 3 })) },
      compliance: { listIsoFrameworks: vi.fn(async () => []) },
      legal: { list: vi.fn(async () => []) },
      control: { list: vi.fn(async () => []) },
      calendar: { list: vi.fn(async () => []) },
    };
    const { ComplianceService } = await import('./index.js');
    const service = new ComplianceService(repos as never, score as never, analytics as never);
    const dashboard = await service.getDashboard(ctx as never);
    expect(dashboard.widgets.controlEffectiveness).toBe(90);
    expect(dashboard.widgets.openAlerts).toBe(2);
    expect(dashboard.trends.monthlyCompliance).toHaveLength(1);
  });
});
