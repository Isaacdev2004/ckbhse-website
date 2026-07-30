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
import { CertificateRepository } from './certificate.repository.js';
import { CPDRepository } from './cpd.repository.js';
import { SessionRepository } from './session.repository.js';
import { TrainerRepository } from './trainer.repository.js';

const baseContext = createUserContext({
  userId: asUserId('user-1'),
  organizationId: asOrganizationId('org-1'),
  sessionId: asSessionId('session-1'),
  roles: ['learner'],
  permissions: [PERMISSIONS.LEARNING_ACCESS, PERMISSIONS.CERTIFICATE_READ],
  metadata: { requestId: 'req-1' },
});

describe('CertificateRepository', () => {
  it('lists certificates for organization', async () => {
    const store = { listCertificates: async () => [{ certificateNumber: 'CK-1' }] };
    const repo = new CertificateRepository(store as never);
    const items = await repo.list(baseContext);
    expect(items[0]?.certificateNumber).toBe('CK-1');
  });

  it('requires issue permission', () => {
    const repo = new CertificateRepository({} as never);
    expect(() =>
      repo.issue(baseContext, {
        userId: 'user-1',
        courseCategory: 'health-safety',
        courseSlug: 'iosh',
        certificateNumber: 'CK-2',
      }),
    ).toThrow(AppError);
  });
});

describe('CPDRepository', () => {
  it('sums CPD hours for user', async () => {
    const store = { sumCpdHours: async () => 12 };
    const repo = new CPDRepository(store as never);
    const total = await repo.sumHours(baseContext);
    expect(total).toBe(12);
  });
});

describe('SessionRepository', () => {
  it('lists upcoming sessions', async () => {
    const store = { listSessions: async () => [{ id: 's-1', title: 'Session' }] };
    const repo = new SessionRepository(store as never);
    const items = await repo.list(baseContext, { upcomingOnly: true });
    expect(items).toHaveLength(1);
  });
});

describe('TrainerRepository', () => {
  it('requires assessment mark for attendance updates', () => {
    const repo = new TrainerRepository({} as never);
    expect(() =>
      repo.updateAttendance(
        createUserContext({
          userId: asUserId('user-1'),
          organizationId: asOrganizationId('org-1'),
          sessionId: asSessionId('session-1'),
          roles: ['trainer'],
          permissions: [PERMISSIONS.COURSE_READ],
          metadata: { requestId: 'req-1' },
        }),
        'att-1',
        { status: 'present' },
      ),
    ).toThrow(AppError);
  });
});
