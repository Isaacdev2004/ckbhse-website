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
import { LearningRepository } from './learning.repository.js';
import { CertificateRepository } from './certificate.repository.js';
import { AssessmentRepository } from './assessment.repository.js';

describe('LearningRepository', () => {
  const context = createUserContext({
    userId: asUserId('user-1'),
    organizationId: asOrganizationId('org-1'),
    sessionId: asSessionId('session-1'),
    roles: ['learner'],
    permissions: [PERMISSIONS.LEARNING_ACCESS],
    metadata: { requestId: 'req-1' },
  });

  it('lists pathways', async () => {
    const store = { listPathways: async () => [{ id: 'p-1', title: 'H&S Manager' }] };
    const repo = new LearningRepository(store as never);
    const pathways = await repo.listPathways(context);
    expect(pathways[0]?.title).toBe('H&S Manager');
  });

  it('requires learning access permission', () => {
    const repo = new LearningRepository({ listPathways: async () => [] } as never);
    expect(() =>
      repo.listPathways(
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

describe('CertificateRepository', () => {
  it('requires certificate read permission', () => {
    const repo = new CertificateRepository({} as never);
    expect(() =>
      repo.list(
        createUserContext({
          userId: asUserId('user-1'),
          organizationId: asOrganizationId('org-1'),
          sessionId: asSessionId('session-1'),
          roles: [],
          permissions: [PERMISSIONS.LEARNING_ACCESS],
          metadata: { requestId: 'req-1' },
        }),
      ),
    ).toThrow(AppError);
  });
});

describe('AssessmentRepository', () => {
  it('lists assessments with learning access', async () => {
    const store = { listAssessments: async () => [{ id: 'a-1' }] };
    const repo = new AssessmentRepository(store as never);
    const items = await repo.list(
      createUserContext({
        userId: asUserId('user-1'),
        organizationId: asOrganizationId('org-1'),
        sessionId: asSessionId('session-1'),
        roles: ['learner'],
        permissions: [PERMISSIONS.LEARNING_ACCESS],
        metadata: { requestId: 'req-1' },
      }),
    );
    expect(items).toHaveLength(1);
  });
});
