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

export class LearningRepository {
  constructor(private readonly store: DrizzleLearningStore) {}

  listPathways(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.listPathways(requireOrganizationId(context));
  }

  getPathway(context: AuthorizationContext, pathwayId: string) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.getPathway(requireOrganizationId(context), pathwayId);
  }

  listPathwayCourses(context: AuthorizationContext, pathwayId: string) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.listPathwayCourses(pathwayId);
  }

  listProgress(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.listProgress(
      requireOrganizationId(context),
      requireUserId(context),
    );
  }

  updateProgress(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleLearningStore['upsertProgress']>[0], 'organizationId' | 'userId'>,
  ) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.upsertProgress({
      ...input,
      organizationId: requireOrganizationId(context),
      userId: requireUserId(context),
    });
  }

  search(context: AuthorizationContext, keyword: string) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.searchLearning(
      requireOrganizationId(context),
      keyword,
      context.userId,
    );
  }
}
