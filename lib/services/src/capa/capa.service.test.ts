import { describe, expect, it, vi } from 'vitest';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { CapaService } from './index.js';

const ctx = {
  organizationId: '00000000-0000-4000-8000-000000000002',
  userId: 'user-1',
  permissions: new Set([
    PERMISSIONS.CAPA_READ,
    PERMISSIONS.CAPA_CREATE,
    PERMISSIONS.CAPA_UPDATE,
    PERMISSIONS.CAPA_VERIFY,
    PERMISSIONS.CAPA_APPROVE,
    PERMISSIONS.CAPA_CLOSE,
    PERMISSIONS.CAPA_ESCALATE,
  ]),
  roles: new Set<string>(),
} as const;

function mockCapaRepo(overrides: Record<string, unknown> = {}) {
  return {
    list: vi.fn(async () => []),
    get: vi.fn(async () => null),
    create: vi.fn(async (_c: unknown, input: unknown) => ({
      id: 'capa-1',
      capaNumber: 'CAPA-2026-001',
      ...(input as object),
    })),
    update: vi.fn(async (_c: unknown, _id: string, patch: unknown) => ({
      id: 'capa-1',
      ...(patch as object),
    })),
    dashboardCounts: vi.fn(async () => ({
      total: 10,
      open: 2,
      inProgress: 3,
      pendingVerification: 1,
      pendingApproval: 1,
      closed: 3,
      overdue: 0,
      corrective: 6,
      preventive: 4,
    })),
    createNotification: vi.fn(async () => ({})),
    getRca: vi.fn(async () => null),
    listVerifications: vi.fn(async () => []),
    listApprovals: vi.fn(async () => []),
    listEscalations: vi.fn(async () => []),
    listNotifications: vi.fn(async () => []),
    upsertRca: vi.fn(async (_c: unknown, input: unknown) => input),
    createVerification: vi.fn(async (_c: unknown, input: unknown) => input),
    createApproval: vi.fn(async (_c: unknown, input: unknown) => input),
    createEscalation: vi.fn(async (_c: unknown, input: unknown) => input),
    ...overrides,
  };
}

describe('CapaService', () => {
  it('creates CAPA and notification', async () => {
    const capa = mockCapaRepo();
    const service = new CapaService(capa as never);
    await service.create(ctx as never, { title: 'Fix guard rail', capaType: 'corrective' });
    expect(capa.create).toHaveBeenCalled();
    expect(capa.createNotification).toHaveBeenCalled();
  });

  it('throws when CAPA not found', async () => {
    const capa = mockCapaRepo();
    const service = new CapaService(capa as never);
    await expect(service.get(ctx as never, 'missing')).rejects.toThrow(AppError);
  });

  it('returns dashboard KPIs from repository counts', async () => {
    const capa = mockCapaRepo();
    const service = new CapaService(capa as never);
    const dashboard = await service.getDashboard(ctx as never);
    expect(dashboard.statistics.total).toBe(10);
    expect(dashboard.kpis.closureRate).toBe(30);
    expect(dashboard.kpis.verificationPending).toBe(1);
  });

  it('filters draft records from portal list', async () => {
    const capa = mockCapaRepo({
      list: vi.fn(async () => [
        { id: '1', capaNumber: 'A', title: 'Open', status: 'open', capaType: 'corrective', priority: 'high', dueDate: null },
        { id: '2', capaNumber: 'B', title: 'Draft', status: 'draft', capaType: 'preventive', priority: 'low', dueDate: null },
      ]),
    });
    const service = new CapaService(capa as never);
    const items = await service.listForPortal(ctx as never);
    expect(items).toHaveLength(1);
    expect(items[0]?.status).toBe('open');
  });

  it('moves to pending approval after effective verification', async () => {
    const capa = mockCapaRepo();
    const service = new CapaService(capa as never);
    await service.verify(ctx as never, 'capa-1', { result: 'effective' });
    expect(capa.update).toHaveBeenCalledWith(
      expect.anything(),
      'capa-1',
      expect.objectContaining({ status: 'pending_approval' }),
    );
  });

  it('returns to in progress after ineffective verification', async () => {
    const capa = mockCapaRepo();
    const service = new CapaService(capa as never);
    await service.verify(ctx as never, 'capa-1', { result: 'ineffective' });
    expect(capa.update).toHaveBeenCalledWith(
      expect.anything(),
      'capa-1',
      expect.objectContaining({ status: 'in_progress' }),
    );
  });

  it('approves CAPA and sets completed timestamp', async () => {
    const capa = mockCapaRepo();
    const service = new CapaService(capa as never);
    await service.approve(ctx as never, 'capa-1', 'Looks good');
    expect(capa.createApproval).toHaveBeenCalled();
    expect(capa.update).toHaveBeenCalledWith(
      expect.anything(),
      'capa-1',
      expect.objectContaining({ status: 'approved' }),
    );
  });

  it('closes CAPA record', async () => {
    const capa = mockCapaRepo();
    const service = new CapaService(capa as never);
    await service.close(ctx as never, 'capa-1');
    expect(capa.update).toHaveBeenCalledWith(
      expect.anything(),
      'capa-1',
      expect.objectContaining({ status: 'closed' }),
    );
  });

  it('escalates CAPA and marks overdue', async () => {
    const capa = mockCapaRepo();
    const service = new CapaService(capa as never);
    await service.escalate(ctx as never, 'capa-1', { reason: 'Past due date' });
    expect(capa.createEscalation).toHaveBeenCalled();
    expect(capa.update).toHaveBeenCalledWith(
      expect.anything(),
      'capa-1',
      expect.objectContaining({ status: 'overdue' }),
    );
  });

  it('submits CAPA for verification', async () => {
    const capa = mockCapaRepo();
    const service = new CapaService(capa as never);
    await service.submitForVerification(ctx as never, 'capa-1');
    expect(capa.update).toHaveBeenCalledWith(
      expect.anything(),
      'capa-1',
      expect.objectContaining({ status: 'pending_verification' }),
    );
  });

  it('persists root cause analysis', async () => {
    const capa = mockCapaRepo();
    const service = new CapaService(capa as never);
    await service.saveRca(ctx as never, 'capa-1', {
      summary: 'Inadequate guard',
      rootCauses: ['Missing barrier'],
    });
    expect(capa.upsertRca).toHaveBeenCalled();
  });
});
