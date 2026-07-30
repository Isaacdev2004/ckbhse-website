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

export class SessionRepository {
  constructor(private readonly store: DrizzleLearningStore) {}

  list(
    context: AuthorizationContext,
    filters?: Parameters<DrizzleLearningStore['listSessions']>[1],
  ) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.listSessions(requireOrganizationId(context), filters);
  }

  get(context: AuthorizationContext, sessionId: string) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.getSession(requireOrganizationId(context), sessionId);
  }
}
