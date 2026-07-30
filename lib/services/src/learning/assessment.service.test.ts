import { AppError } from '@workspace/platform/errors';
import { describe, expect, it, vi } from 'vitest';
import { AssessmentService } from './assessment.service.js';
import { EnrollmentService } from './enrollment.service.js';
import { PERMISSIONS } from '@workspace/platform/permissions';

describe('AssessmentService', () => {
  it('rejects start when max attempts reached', async () => {
    const service = new AssessmentService({
      get: async () => ({ id: 'a-1', maxAttempts: 2 }),
      listAttempts: async () => [{ id: 't-1' }, { id: 't-2' }],
      startAttempt: async () => ({}),
      listQuestions: async () => [],
      submitAttempt: async () => null,
    } as never);

    await expect(
      service.start({ userId: 'u-1', organizationId: 'o-1' } as never, 'a-1'),
    ).rejects.toThrow(AppError);
  });

  it('scores submitted answers', async () => {
    const service = new AssessmentService({
      listAttempts: async () => [
        { id: 'attempt-1', assessmentId: 'a-1', attemptNumber: 1 },
      ],
      get: async () => ({ id: 'a-1', passingScore: 70, maxAttempts: 3 }),
      listQuestions: async () => [
        {
          id: 'q-1',
          correctAnswer: 'yes',
          points: 1,
        },
      ],
      submitAttempt: async (
        _ctx: unknown,
        _id: unknown,
        patch: { score?: number; passed?: boolean },
      ) => ({ ...patch, id: 'attempt-1' }),
      startAttempt: async () => ({}),
    } as never);

    const result = await service.submit(
      { userId: 'u-1', organizationId: 'o-1' } as never,
      'attempt-1',
      [{ questionId: 'q-1', answer: 'yes' }],
    );
    expect(result?.passed).toBe(true);
    expect(result?.score).toBe(100);
  });
});

describe('EnrollmentService', () => {
  it('creates progress record on enrolment', async () => {
    const upsertProgress = vi.fn();
    const service = new EnrollmentService(
      {
        selfEnroll: async () => ({
          id: 'e-1',
          organizationId: 'org-1',
          userId: 'user-1',
        }),
        create: async () => ({
          id: 'e-1',
          organizationId: 'org-1',
          userId: 'user-1',
        }),
        list: async () => [],
        update: async () => null,
      } as never,
      { upsertProgress } as never,
    );

    await service.enroll(
      {
        userId: 'user-1',
        organizationId: 'org-1',
        permissions: new Set([PERMISSIONS.LEARNING_ACCESS]),
      } as never,
      { courseCategory: 'health-safety', courseSlug: 'iosh' },
    );

    expect(upsertProgress).toHaveBeenCalled();
  });
});
