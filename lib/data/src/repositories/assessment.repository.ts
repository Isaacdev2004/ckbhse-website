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

export class AssessmentRepository {
  constructor(private readonly store: DrizzleLearningStore) {}

  list(context: AuthorizationContext, courseCategory?: string, courseSlug?: string) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.listAssessments(
      requireOrganizationId(context),
      courseCategory,
      courseSlug,
    );
  }

  get(context: AuthorizationContext, assessmentId: string) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.getAssessment(requireOrganizationId(context), assessmentId);
  }

  listQuestions(context: AuthorizationContext, assessmentId: string) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.listQuestions(assessmentId);
  }

  startAttempt(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleLearningStore['createAttempt']>[0], 'organizationId' | 'userId'>,
  ) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.createAttempt({
      ...input,
      organizationId: requireOrganizationId(context),
      userId: requireUserId(context),
    });
  }

  submitAttempt(
    context: AuthorizationContext,
    attemptId: string,
    patch: Parameters<DrizzleLearningStore['submitAttempt']>[2],
    answers: Parameters<DrizzleLearningStore['createAnswers']>[0],
  ) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    const orgId = requireOrganizationId(context);
    return this.store.submitAttempt(orgId, attemptId, patch).then(async (attempt) => {
      if (attempt !== null && answers.length > 0) {
        await this.store.createAnswers(answers);
      }
      return attempt;
    });
  }

  listAttempts(context: AuthorizationContext, assessmentId?: string) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.listAttempts(
      requireOrganizationId(context),
      requireUserId(context),
      assessmentId,
    );
  }
}
