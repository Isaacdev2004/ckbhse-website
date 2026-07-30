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

export class TrainerRepository {
  constructor(private readonly store: DrizzleLearningStore) {}

  listAssignments(context: AuthorizationContext, trainerId?: string) {
    requirePermission(context, PERMISSIONS.COURSE_READ);
    return this.store.listTrainerAssignments(
      requireOrganizationId(context),
      trainerId ?? context.userId,
    );
  }

  listSessions(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.COURSE_READ);
    return this.store.listSessions(requireOrganizationId(context));
  }

  listAttendance(context: AuthorizationContext, sessionId: string) {
    requirePermission(context, PERMISSIONS.ASSESSMENT_MARK);
    return this.store.listAttendance(sessionId);
  }

  updateAttendance(
    context: AuthorizationContext,
    attendanceId: string,
    patch: Parameters<DrizzleLearningStore['updateAttendance']>[2],
  ) {
    requirePermission(context, PERMISSIONS.ASSESSMENT_MARK);
    return this.store.updateAttendance(
      requireOrganizationId(context),
      attendanceId,
      patch,
    );
  }
}
