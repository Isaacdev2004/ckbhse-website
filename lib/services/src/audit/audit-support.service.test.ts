import { describe, expect, it } from 'vitest';
import { AuditCalendarService } from './audit-calendar.service.js';
import { AuditReportService } from './audit-report.service.js';

describe('AuditCalendarService', () => {
  it('maps upcoming audits to calendar events', async () => {
    const audit = {
      listUpcoming: async () => [
        {
          id: 'a1',
          name: 'Fire Safety',
          plannedStart: new Date('2026-08-01T09:00:00Z'),
          plannedEnd: new Date('2026-08-01T17:00:00Z'),
          status: 'scheduled',
          site: 'HQ',
        },
      ],
    };
    const service = new AuditCalendarService(audit as never);
    const events = await service.listEvents({
      organizationId: 'org',
      permissions: new Set(),
      roles: new Set(),
    } as never);
    expect(events).toHaveLength(1);
    expect(events[0]?.outlookSyncPlaceholder).toBe(true);
  });
});

describe('AuditReportService', () => {
  it('creates report metadata placeholder', async () => {
    const store = {
      listFindings: async () => [{ id: 'f1' }],
      createReport: async (input: Record<string, unknown>) => ({ id: 'r1', ...input }),
    };
    const auditRepo = {
      get: async () => ({
        id: 'a1',
        organizationId: 'org',
        name: 'ISO Audit',
        score: 92,
      }),
    };
    const service = new AuditReportService(store as never, auditRepo as never);
    const report = await service.generate(
      { organizationId: 'org', userId: 'u1', permissions: new Set(), roles: new Set() } as never,
      'a1',
      'executive',
    );
    expect(report?.reportType).toBe('executive');
    expect((report?.summary as { pdfGenerationPlaceholder?: boolean }).pdfGenerationPlaceholder).toBe(true);
  });

  it('returns null when audit missing', async () => {
    const service = new AuditReportService(
      { listFindings: async () => [], createReport: async () => ({}) } as never,
      { get: async () => null } as never,
    );
    const report = await service.generate(
      { organizationId: 'org', permissions: new Set(), roles: new Set() } as never,
      'missing',
      'summary',
    );
    expect(report).toBeNull();
  });
});
