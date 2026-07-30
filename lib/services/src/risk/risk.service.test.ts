import { describe, expect, it, vi } from 'vitest';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { RiskService } from './index.js';

const ctx = {
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: 'user-1',
  permissions: new Set([
    PERMISSIONS.RISK_ASSESSMENT_READ,
    PERMISSIONS.RISK_ASSESSMENT_MANAGE,
  ]),
  roles: new Set<string>(),
} as const;

function mockRiskRepo(overrides: Record<string, unknown> = {}) {
  return {
    listAssessments: vi.fn(async () => []),
    getAssessment: vi.fn(async () => null),
    createAssessment: vi.fn(async (_c: unknown, input: unknown) => ({
      id: 'ra-1',
      assessmentNumber: 'RA-2026-001',
      ...(input as object),
    })),
    updateAssessment: vi.fn(async (_c: unknown, _id: string, patch: unknown) => ({
      id: 'ra-1',
      ...(patch as object),
    })),
    getDefaultMatrix: vi.fn(async () => ({
      id: 'matrix-1',
      ratingThresholds: [],
    })),
    listMatrices: vi.fn(async () => []),
    listHazards: vi.fn(async () => []),
    listTreatments: vi.fn(async () => []),
    listReviews: vi.fn(async () => []),
    listBowtieElements: vi.fn(async () => []),
    createHazard: vi.fn(async (_c: unknown, input: unknown) => input),
    createTreatment: vi.fn(async (_c: unknown, input: unknown) => input),
    createReview: vi.fn(async (_c: unknown, input: unknown) => input),
    createBowtieElement: vi.fn(async (_c: unknown, input: unknown) => input),
    dashboardCounts: vi.fn(async () => ({
      total: 5,
      active: 2,
      under_review: 1,
      approved: 1,
      hazards: 3,
      highCritical: 1,
      overdueReviews: 0,
      treatmentsOpen: 2,
    })),
    heatMapData: vi.fn(async () => [
      { likelihood: 2, severity: 2, rating: 'low' },
    ]),
    ...overrides,
  };
}

describe('RiskService', () => {
  it('creates assessment with scored inherent/residual risk', async () => {
    const risk = mockRiskRepo();
    const service = new RiskService(risk as never);
    await service.create(ctx as never, {
      title: 'Warehouse RA',
      inherentLikelihood: 4,
      inherentSeverity: 3,
      residualLikelihood: 2,
      residualSeverity: 2,
    });
    expect(risk.createAssessment).toHaveBeenCalled();
  });

  it('throws when assessment not found', async () => {
    const risk = mockRiskRepo();
    const service = new RiskService(risk as never);
    await expect(service.get(ctx as never, 'missing')).rejects.toThrow(AppError);
  });

  it('returns dashboard KPIs', async () => {
    const risk = mockRiskRepo({
      listAssessments: vi.fn(async () => [
        { inherentScore: 12, residualScore: 4 },
        { inherentScore: 9, residualScore: 6 },
      ]),
    });
    const service = new RiskService(risk as never);
    const dashboard = await service.getDashboard(ctx as never);
    expect(dashboard.statistics.total).toBe(5);
    expect(dashboard.kpis.reductionRate).toBe(100);
  });

  it('builds heat map from repository data', async () => {
    const risk = mockRiskRepo();
    const service = new RiskService(risk as never);
    const heatmap = await service.getHeatMap(ctx as never);
    expect(heatmap.cells).toHaveLength(1);
  });

  it('filters draft/archived from portal list', async () => {
    const risk = mockRiskRepo({
      listAssessments: vi.fn(async () => [
        { id: '1', assessmentNumber: 'A', title: 'Active', status: 'active', residualRating: 'low', reviewDueDate: null },
        { id: '2', assessmentNumber: 'B', title: 'Draft', status: 'draft', residualRating: null, reviewDueDate: null },
      ]),
    });
    const service = new RiskService(risk as never);
    const items = await service.listForPortal(ctx as never);
    expect(items).toHaveLength(1);
  });
});
