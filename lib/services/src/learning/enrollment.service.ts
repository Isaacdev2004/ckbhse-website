import type { AuthorizationContext } from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { EnrollmentRepository } from '@workspace/data/repositories/enrollment';
import type { DrizzleLearningStore } from '@workspace/data/stores/learning';

export class EnrollmentService {
  constructor(
    private readonly enrollment: EnrollmentRepository,
    private readonly store: DrizzleLearningStore,
  ) {}

  list(context: AuthorizationContext, filters?: { status?: string; mandatoryOnly?: boolean }) {
    return this.enrollment.list(context, {
      ...(context.userId !== undefined ? { userId: context.userId } : {}),
      ...filters,
    });
  }

  async enroll(
    context: AuthorizationContext,
    input: {
      courseCategory: string;
      courseSlug: string;
      pathwayId?: string;
      isMandatory?: boolean;
      source?: 'self' | 'manager' | 'administrator' | 'mandatory';
    },
  ) {
    const canManage = context.permissions.has(PERMISSIONS.ENROLMENT_MANAGE);
    const enrollment = canManage
      ? await this.enrollment.create(context, {
          userId: input.source === 'self' ? context.userId! : context.userId!,
          courseCategory: input.courseCategory,
          courseSlug: input.courseSlug,
          pathwayId: input.pathwayId ?? null,
          isMandatory: input.isMandatory ?? false,
          source: input.source ?? 'self',
          status: 'active',
        })
      : await this.enrollment.selfEnroll(context, {
          courseCategory: input.courseCategory,
          courseSlug: input.courseSlug,
          pathwayId: input.pathwayId ?? null,
          isMandatory: input.isMandatory ?? false,
          status: 'active',
        });

    await this.store.upsertProgress({
      enrollmentId: enrollment.id,
      organizationId: enrollment.organizationId,
      userId: enrollment.userId,
      status: 'not_started',
      completionPercent: 0,
      timeSpentMinutes: 0,
      attempts: 0,
      bookmarked: false,
    });

    return enrollment;
  }

  cancel(context: AuthorizationContext, enrollmentId: string) {
    return this.enrollment.update(context, enrollmentId, {
      status: 'cancelled',
      cancelledAt: new Date(),
    });
  }

  approve(context: AuthorizationContext, enrollmentId: string) {
    return this.enrollment.update(context, enrollmentId, {
      status: 'active',
      approvedAt: new Date(),
    });
  }
}
