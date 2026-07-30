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

export class CPDRepository {
  constructor(private readonly store: DrizzleLearningStore) {}

  list(context: AuthorizationContext, userId?: string) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.listCpdRecords(
      requireOrganizationId(context),
      userId ?? context.userId,
    );
  }

  create(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleLearningStore['createCpdRecord']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.ENROLMENT_MANAGE);
    return this.store.createCpdRecord({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }

  sumHours(context: AuthorizationContext, year?: number) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.sumCpdHours(
      requireOrganizationId(context),
      requireUserId(context),
      year,
    );
  }
}
