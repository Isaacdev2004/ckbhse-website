import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { AdminService } from './admin.service.js';

const adminCtx = {
  organizationId: '00000000-0000-4000-8000-000000000001',
  userId: '00000000-0000-4000-8000-000000000011',
  permissions: new Set([
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.TENANT_VIEW_ALL,
    PERMISSIONS.USER_READ,
    PERMISSIONS.AUDIT_LOG_READ,
    PERMISSIONS.SYSTEM_READ,
  ]),
  roles: new Set<string>(),
} as const;

describe('AdminService', () => {
  it('returns dashboard counts from repository', async () => {
    const admin = {
      dashboardCounts: vi.fn(async () => ({
        organizationCount: 3,
        userCount: 12,
        activeUserCount: 10,
        auditLogCount24h: 45,
        openOutboxJobs: 2,
      })),
    };
    const system = { getHealth: vi.fn(), getVersionInfo: vi.fn() };
    const service = new AdminService(admin as never, system as never);
    const dashboard = await service.getDashboard(adminCtx as never);
    expect(dashboard.organizationCount).toBe(3);
    expect(dashboard.auditLogCount24h).toBe(45);
  });

  it('maps audit log rows to API shape', async () => {
    const admin = {
      searchAuditLogs: vi.fn(async () => [
        {
          id: 'log-1',
          organizationId: 'org-1',
          entity: 'lead',
          entityId: 'lead-1',
          action: 'update',
          eventType: 'lead.updated',
          severity: 'info',
          actorUserId: 'user-1',
          actorKind: 'user',
          requestId: 'req-1',
          occurredAt: new Date('2026-07-01T10:00:00.000Z'),
          previousValues: { status: 'new' },
          newValues: { status: 'qualified' },
        },
      ]),
    };
    const system = { getHealth: vi.fn(), getVersionInfo: vi.fn() };
    const service = new AdminService(admin as never, system as never);
    const items = await service.searchAuditLogs(adminCtx as never, { entity: 'lead' });
    expect(items).toHaveLength(1);
    expect(items[0]?.entityId).toBe('lead-1');
    expect(items[0]?.occurredAt).toBe('2026-07-01T10:00:00.000Z');
  });
});
