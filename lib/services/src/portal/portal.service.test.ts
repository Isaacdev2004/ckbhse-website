import { describe, expect, it } from 'vitest';
import { PortalService } from './portal.service.js';

describe('PortalService.getDashboard', () => {
  it('maps repository data into dashboard response', async () => {
    const service = new PortalService({
      getOrganization: async () => ({
        id: 'org-1',
        name: 'Acme Manufacturing Ltd',
        slug: 'acme',
        status: 'active',
        type: 'client',
        profile: {
          complianceScore: 87,
          healthScore: 92,
        },
      }),
      dashboardCounts: async () => ({
        openActions: 2,
        expiringCertificates: 1,
        openSupportTickets: 1,
      }),
      listAudits: async () => [
        {
          id: 'audit-1',
          title: 'Q3 Audit',
          scheduledAt: new Date('2026-08-01T00:00:00.000Z'),
          status: 'scheduled',
        },
      ],
      listDocuments: async () => [
        {
          id: 'doc-1',
          name: 'Policy.pdf',
          category: 'Policies',
          updatedAt: new Date('2026-07-01T00:00:00.000Z'),
        },
      ],
      listActivities: async () => [
        {
          id: 'act-1',
          kind: 'project',
          summary: 'Project updated',
          occurredAt: new Date('2026-07-28T00:00:00.000Z'),
        },
      ],
      listProjects: async () => [
        {
          id: 'proj-1',
          name: 'ISO Support',
          status: 'active',
          progressPercent: 65,
        },
      ],
    } as never);

    const dashboard = await service.getDashboard({} as never);
    expect(dashboard.organizationName).toBe('Acme Manufacturing Ltd');
    expect(dashboard.complianceScore).toBe(87);
    expect(dashboard.openActions).toBe(2);
    expect(dashboard.activeProjects).toHaveLength(1);
  });
});
