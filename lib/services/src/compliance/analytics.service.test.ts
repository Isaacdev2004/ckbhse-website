import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { ComplianceAnalyticsService } from './analytics.js';

const ctx = {
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: 'user-1',
  permissions: new Set([
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.COMPLIANCE_MANAGE,
    PERMISSIONS.REGULATORY_READ,
    PERMISSIONS.REGULATORY_MANAGE,
    PERMISSIONS.CONTROL_READ,
  ]),
  roles: new Set<string>(),
} as const;

function mockAnalytics(overrides: Record<string, unknown> = {}) {
  return {
    listKpiSnapshots: vi.fn(async () => [
      {
        snapshotMonth: '2026-05',
        complianceScore: 78,
        auditCompletion: 70,
        inspectionCompletion: 65,
        capaCompletion: 60,
        trainingCompletion: 75,
        controlEffectiveness: 80,
        openFindings: 4,
      },
      {
        snapshotMonth: '2026-06',
        complianceScore: 82,
        auditCompletion: 75,
        inspectionCompletion: 70,
        capaCompletion: 68,
        trainingCompletion: 76,
        controlEffectiveness: 82,
        openFindings: 3,
      },
    ]),
    controlEffectiveness: vi.fn(async () => ({
      total: 10,
      effective: 8,
      partiallyEffective: 1,
      ineffective: 1,
      effectivenessRate: 80,
    })),
    listAlerts: vi.fn(async () => [
      {
        id: 'a1',
        title: 'Legal review due',
        severity: 'critical',
        status: 'open',
        alertType: 'legal_review',
      },
      {
        id: 'a2',
        title: 'Regulation update',
        severity: 'medium',
        status: 'open',
        alertType: 'regulation_change',
      },
    ]),
    regulatoryMonitoring: vi.fn(async () => ({
      total: 12,
      compliant: 8,
      reviewRequired: 2,
      nonCompliant: 2,
    })),
    upsertKpiSnapshot: vi.fn(async (_c: unknown, input: unknown) => input),
    createExport: vi.fn(async (_c: unknown, input: unknown) => ({
      id: 'job-1',
      ...(input as object),
    })),
    completeExport: vi.fn(async (_c: unknown, jobId: string, fileKey: string) => ({
      id: jobId,
      fileKey,
      status: 'ready',
    })),
    ...overrides,
  };
}

function mockRepos() {
  return {
    audit: {
      dashboardCounts: vi.fn(async () => ({
        total: 10,
        closed: 8,
        openFindings: 2,
        averageScore: 88,
      })),
    },
    inspection: {
      dashboardCounts: vi.fn(async () => ({
        total: 8,
        completed: 4,
        passed: 2,
        openFindings: 1,
        overdue: 1,
        averageScore: 85,
      })),
    },
    capa: {
      dashboardCounts: vi.fn(async () => ({
        total: 5,
        closed: 4,
        overdue: 0,
      })),
    },
    compliance: {
      listIsoFrameworks: vi.fn(async () => [{ id: 'fw-1', name: 'ISO 45001' }]),
      listIsoClauses: vi.fn(async () => [{ id: 'c1', clauseNumber: '6.1' }]),
    },
    regulatory: {
      list: vi.fn(async () => [{ id: 'r1', title: 'HASAWA' }]),
    },
    legal: {
      list: vi.fn(async () => [
        { id: 'l1', regulation: 'Fire Safety', reviewDate: new Date('2026-08-01') },
      ]),
    },
    calendar: {
      list: vi.fn(async () => []),
      create: vi.fn(async (_c: unknown, input: unknown) => input),
    },
  };
}

function mockScore() {
  return {
    calculate: vi.fn(async () => ({
      organizationScore: 84,
      breakdown: { audit: 40, inspection: 44 },
    })),
  };
}

describe('ComplianceAnalyticsService', () => {
  it('builds executive dashboard with trend direction', async () => {
    const service = new ComplianceAnalyticsService(
      mockRepos() as never,
      mockAnalytics() as never,
      mockScore() as never,
    );
    const dashboard = await service.getExecutiveDashboard(ctx as never);
    expect(dashboard.complianceScore).toBe(84);
    expect(dashboard.trendDirection).toBe('up');
    expect(dashboard.trendDelta).toBe(4);
    expect(dashboard.widgets.capaCompletion).toBe(80);
    expect(dashboard.widgets.criticalAlerts).toBe(1);
  });

  it('returns regulatory monitoring bundle', async () => {
    const analytics = mockAnalytics();
    const service = new ComplianceAnalyticsService(
      mockRepos() as never,
      analytics as never,
      mockScore() as never,
    );
    const result = await service.getRegulatoryMonitoring(ctx as never);
    expect(result.stats.total).toBe(12);
    expect(result.alerts).toHaveLength(2);
    expect(result.regulations).toHaveLength(1);
  });

  it('records KPI snapshot for current month', async () => {
    const analytics = mockAnalytics();
    const service = new ComplianceAnalyticsService(
      mockRepos() as never,
      analytics as never,
      mockScore() as never,
    );
    await service.recordCurrentKpiSnapshot(ctx as never);
    expect(analytics.upsertKpiSnapshot).toHaveBeenCalled();
  });

  it('syncs calendar events from legal register reviews', async () => {
    const repos = mockRepos();
    const service = new ComplianceAnalyticsService(
      repos as never,
      mockAnalytics() as never,
      mockScore() as never,
    );
    const result = await service.syncCalendarAutomation(ctx as never);
    expect(result.createdCount).toBe(1);
    expect(repos.calendar.create).toHaveBeenCalled();
  });

  it('creates and completes BI export job', async () => {
    const analytics = mockAnalytics();
    const service = new ComplianceAnalyticsService(
      mockRepos() as never,
      analytics as never,
      mockScore() as never,
    );
    const job = await service.createExport(ctx as never, {
      exportType: 'compliance_kpi',
      format: 'json',
    });
    expect(analytics.createExport).toHaveBeenCalled();
    expect(analytics.completeExport).toHaveBeenCalled();
    expect(job?.status).toBe('ready');
  });
});
