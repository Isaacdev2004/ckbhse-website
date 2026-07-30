import { AppError } from '@workspace/platform/errors';
import { describe, expect, it } from 'vitest';
import {
  asOrganizationId,
  asUserId,
} from '@workspace/domain/shared';
import {
  asSessionId,
  createUserContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { PortalRepository } from './portal.repository.js';

describe('PortalRepository permissions', () => {
  const context = createUserContext({
    userId: asUserId('user-1'),
    organizationId: asOrganizationId('org-1'),
    sessionId: asSessionId('session-1'),
    roles: ['client_user'],
    permissions: [PERMISSIONS.PORTAL_ACCESS, PERMISSIONS.PROJECT_READ],
    metadata: { requestId: 'req-1' },
  });

  it('requires portal access for dashboard counts', async () => {
    const store = {
      countOpenActions: async () => 1,
      countExpiringCertificates: async () => 0,
      countOpenTickets: async () => 0,
    };
    const repo = new PortalRepository(store as never);
    const counts = await repo.dashboardCounts(context);
    expect(counts.openActions).toBe(1);
  });

  it('rejects project listing without permission', async () => {
    const repo = new PortalRepository({} as never);
    expect(() =>
      repo.listProjects(
        createUserContext({
          userId: asUserId('user-1'),
          organizationId: asOrganizationId('org-1'),
          sessionId: asSessionId('session-1'),
          roles: [],
          permissions: [PERMISSIONS.PORTAL_ACCESS],
          metadata: { requestId: 'req-1' },
        }),
      ),
    ).toThrow(AppError);
  });
});
