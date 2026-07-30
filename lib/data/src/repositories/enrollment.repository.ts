import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { DrizzleLearningStore } from '../stores/drizzle-learning.store.js';

function requireOrganizationId(context: AuthorizationContext): string {
  if (context.organizationId === undefined) {
    throw AppError.forbidden('Organization scope is required');
  }
  return context.organizationId;
}

function requireUserId(context: AuthorizationContext): string {
  if (context.userId === undefined) {
    throw AppError.forbidden('User scope is required');
  }
  return context.userId;
}

export class EnrollmentRepository {
  constructor(private readonly store: DrizzleLearningStore) {}

  list(context: AuthorizationContext, filters?: Parameters<DrizzleLearningStore['listEnrollments']>[1]) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.listEnrollments(requireOrganizationId(context), filters);
  }

  get(context: AuthorizationContext, enrollmentId: string) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.getEnrollment(requireOrganizationId(context), enrollmentId);
  }

  create(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleLearningStore['createEnrollment']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.ENROLMENT_MANAGE);
    return this.store.createEnrollment({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }

  update(
    context: AuthorizationContext,
    enrollmentId: string,
    patch: Parameters<DrizzleLearningStore['updateEnrollment']>[2],
  ) {
    requirePermission(context, PERMISSIONS.ENROLMENT_MANAGE);
    return this.store.updateEnrollment(
      requireOrganizationId(context),
      enrollmentId,
      patch,
    );
  }

  selfEnroll(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleLearningStore['createEnrollment']>[0], 'organizationId' | 'userId' | 'source'>,
  ) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.createEnrollment({
      ...input,
      organizationId: requireOrganizationId(context),
      userId: requireUserId(context),
      source: 'self',
    });
  }
}
