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

export class TranscriptRepository {
  constructor(private readonly store: DrizzleLearningStore) {}

  get(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.getTranscript(
      requireOrganizationId(context),
      requireUserId(context),
    );
  }

  save(
    context: AuthorizationContext,
    summary: Record<string, unknown>,
  ) {
    requirePermission(context, PERMISSIONS.LEARNING_ACCESS);
    return this.store.upsertTranscript({
      organizationId: requireOrganizationId(context),
      userId: requireUserId(context),
      summary,
      generatedAt: new Date(),
    });
  }
}
