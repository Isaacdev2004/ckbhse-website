import { describe, expect, it, vi } from 'vitest';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { AuditService } from './audit.service.js';

const orgContext = {
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: '00000000-0000-4000-8000-000000000010',
  permissions: new Set([
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.AUDIT_CREATE,
    PERMISSIONS.AUDIT_UPDATE,
    PERMISSIONS.AUDIT_APPROVE,
    PERMISSIONS.AUDIT_CLOSE,
    PERMISSIONS.AUDIT_CONDUCT,
    PERMISSIONS.CHECKLIST_MANAGE,
    PERMISSIONS.EVIDENCE_UPLOAD,
    PERMISSIONS.AUDIT_ASSIGN,
  ]),
  roles: new Set<string>(),
} as const;

function createMocks() {
  const store = {
    listRevisions: vi.fn(async () => []),
    listReports: vi.fn(async () => []),
    createRevision: vi.fn(async (input: unknown) => input),
    createReport: vi.fn(async (input: unknown) => ({ id: 'report-1', ...input as object })),
    listFindings: vi.fn(async () => []),
  };
  const repos = {
    audit: {
      listTypes: vi.fn(async () => [{ key: 'internal', name: 'Internal Audit' }]),
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue(null),
      create: vi.fn(async (ctx: unknown, input: unknown) => ({
        id: 'audit-1',
        organizationId: orgContext.organizationId,
        status: 'draft',
        isImmutable: false,
        version: 1,
        ...(input as object),
      })),
      update: vi.fn(async (_ctx: unknown, _id: string, patch: unknown) => ({
        id: 'audit-1',
        status: 'scheduled',
        isImmutable: false,
        version: 1,
        ...(patch as object),
      })),
      dashboardCounts: vi.fn(async () => ({
        total: 5,
        scheduled: 2,
        inProgress: 1,
        closed: 1,
        cancelled: 0,
        openFindings: 3,
        averageScore: 85,
      })),
      listUpcoming: vi.fn(async () => []),
    },
    template: {
      list: vi.fn(async () => []),
      getDetail: vi.fn(async () => null),
    },
    finding: {
      list: vi.fn(async () => []),
      create: vi.fn(async (_ctx: unknown, input: unknown) => input),
    },
    checklist: {
      list: vi.fn(async () => []),
      saveResponse: vi.fn(async (_ctx: unknown, input: unknown) => input),
    },
    evidence: {
      list: vi.fn(async () => []),
      create: vi.fn(async (_ctx: unknown, input: unknown) => input),
    },
    assignment: {
      list: vi.fn(async () => []),
      assign: vi.fn(async (_ctx: unknown, input: unknown) => input),
    },
  };
  return { store, repos, service: new AuditService(repos as never, store as never) };
}

describe('AuditService', () => {
  it('lists audit types', async () => {
    const { service, repos } = createMocks();
    const types = await service.listTypes(orgContext as never);
    expect(types).toHaveLength(1);
    expect(repos.audit.listTypes).toHaveBeenCalled();
  });

  it('creates audit in draft status', async () => {
    const { service, repos } = createMocks();
    const audit = await service.create(orgContext as never, { name: 'Site Inspection' });
    expect(audit.name).toBe('Site Inspection');
    expect(repos.audit.create).toHaveBeenCalled();
  });

  it('throws when audit not found', async () => {
    const { service } = createMocks();
    await expect(service.get(orgContext as never, 'missing')).rejects.toThrow(AppError);
  });

  it('returns dashboard metrics', async () => {
    const { service } = createMocks();
    const dashboard = await service.getDashboard(orgContext as never);
    expect(dashboard.statistics.total).toBe(5);
    expect(dashboard.kpis.openFindings).toBe(3);
  });

  it('blocks update on immutable audit', async () => {
    const { service, repos } = createMocks();
    repos.audit.get.mockResolvedValueOnce({
      id: 'audit-1',
      isImmutable: true,
      status: 'approved',
      version: 1,
    });
    await expect(
      service.update(orgContext as never, 'audit-1', { name: 'Changed' }),
    ).rejects.toThrow(AppError);
  });

  it('creates revision on approve', async () => {
    const { service, repos, store } = createMocks();
    repos.audit.get.mockResolvedValueOnce({
      id: 'audit-1',
      organizationId: orgContext.organizationId,
      isImmutable: false,
      status: 'review',
      version: 2,
      name: 'Audit',
    });
    await service.approve(orgContext as never, 'audit-1');
    expect(store.createRevision).toHaveBeenCalled();
    expect(repos.audit.update).toHaveBeenCalledWith(
      expect.anything(),
      'audit-1',
      expect.objectContaining({ status: 'approved', isImmutable: true }),
    );
  });

  it('closes audit with close permission', async () => {
    const { service, repos } = createMocks();
    await service.close(orgContext as never, 'audit-1');
    expect(repos.audit.update).toHaveBeenCalledWith(
      expect.anything(),
      'audit-1',
      expect.objectContaining({ status: 'closed' }),
    );
  });

  it('creates findings with conduct permission', async () => {
    const { service, repos } = createMocks();
    await service.createFinding(orgContext as never, 'audit-1', {
      title: 'Missing PPE',
      severity: 'major',
    });
    expect(repos.finding.create).toHaveBeenCalled();
  });

  it('saves checklist responses', async () => {
    const { service, repos } = createMocks();
    await service.saveChecklistResponse(orgContext as never, {
      auditId: 'audit-1',
      templateItemId: 'item-1',
      responseValue: 'pass',
    });
    expect(repos.checklist.saveResponse).toHaveBeenCalled();
  });

  it('uploads evidence', async () => {
    const { service, repos } = createMocks();
    await service.createEvidence(orgContext as never, {
      auditId: 'audit-1',
      fileName: 'photo.jpg',
    });
    expect(repos.evidence.create).toHaveBeenCalled();
  });

  it('assigns auditors', async () => {
    const { service, repos } = createMocks();
    await service.assign(orgContext as never, {
      auditId: 'audit-1',
      userId: 'user-2',
      role: 'co_auditor',
    });
    expect(repos.assignment.assign).toHaveBeenCalled();
  });

  it('filters portal list to visible statuses', async () => {
    const { service, repos } = createMocks();
    repos.audit.list.mockResolvedValueOnce([
      { id: '1', name: 'A', status: 'published', plannedStart: null, site: null, score: 90 },
      { id: '2', name: 'B', status: 'draft', plannedStart: null, site: null, score: null },
    ]);
    const items = await service.listForPortal(orgContext as never);
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('A');
  });

  it('rejects invalid status regression', async () => {
    const { service, repos } = createMocks();
    repos.audit.get.mockResolvedValueOnce({
      id: 'audit-1',
      isImmutable: false,
      status: 'closed',
      version: 1,
    });
    await expect(
      service.update(orgContext as never, 'audit-1', { status: 'scheduled' }),
    ).rejects.toThrow(AppError);
  });

  it('loads audit detail with related entities', async () => {
    const { service, repos } = createMocks();
    repos.audit.get.mockResolvedValueOnce({
      id: 'audit-1',
      name: 'Full Audit',
      status: 'in_progress',
    });
    const detail = await service.get(orgContext as never, 'audit-1');
    expect(detail.audit.name).toBe('Full Audit');
    expect(detail.findings).toEqual([]);
  });
});

describe('AuditService workflow', () => {
  it('allows forward status progression', async () => {
    const { service, repos } = createMocks();
    repos.audit.get.mockResolvedValueOnce({
      id: 'audit-1',
      isImmutable: false,
      status: 'draft',
      version: 1,
    });
    await service.update(orgContext as never, 'audit-1', { status: 'scheduled' });
    expect(repos.audit.update).toHaveBeenCalled();
  });
});
