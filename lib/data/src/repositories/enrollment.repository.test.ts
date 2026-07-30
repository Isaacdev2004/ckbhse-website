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
import { EnrollmentRepository } from './enrollment.repository.js';

describe('EnrollmentRepository', () => {
  const baseContext = createUserContext({
    userId: asUserId('user-1'),
    organizationId: asOrganizationId('org-1'),
    sessionId: asSessionId('session-1'),
    roles: ['learner'],
    permissions: [PERMISSIONS.LEARNING_ACCESS, PERMISSIONS.ENROLMENT_MANAGE],
    metadata: { requestId: 'req-1' },
  });

  it('lists enrollments with learning access', async () => {
    const store = { listEnrollments: async () => [{ id: 'e-1' }] };
    const repo = new EnrollmentRepository(store as never);
    const items = await repo.list(baseContext);
    expect(items).toHaveLength(1);
  });

  it('rejects create without enrolment manage permission', () => {
    const repo = new EnrollmentRepository({} as never);
    expect(() =>
      repo.create(
        createUserContext({
          userId: asUserId('user-1'),
          organizationId: asOrganizationId('org-1'),
          sessionId: asSessionId('session-1'),
          roles: ['learner'],
          permissions: [PERMISSIONS.LEARNING_ACCESS],
          metadata: { requestId: 'req-1' },
        }),
        {
          userId: 'user-1',
          courseCategory: 'health-safety',
          courseSlug: 'iosh',
          status: 'active',
          source: 'manager',
          isMandatory: false,
        },
      ),
    ).toThrow(AppError);
  });

  it('allows self enrolment with learning access', async () => {
    const store = {
      createEnrollment: async (input: { userId: string }) => ({
        id: 'e-1',
        ...input,
        organizationId: 'org-1',
        status: 'active',
      }),
    };
    const repo = new EnrollmentRepository(store as never);
    const enrollment = await repo.selfEnroll(
      createUserContext({
        userId: asUserId('user-1'),
        organizationId: asOrganizationId('org-1'),
        sessionId: asSessionId('session-1'),
        roles: ['learner'],
        permissions: [PERMISSIONS.LEARNING_ACCESS],
        metadata: { requestId: 'req-1' },
      }),
      {
        courseCategory: 'health-safety',
        courseSlug: 'iosh',
        status: 'active',
        isMandatory: false,
      },
    );
    expect(enrollment.source).toBe('self');
    expect(store.createEnrollment).toBeDefined();
  });
});
