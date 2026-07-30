import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { DrizzleAuditStore } from '../stores/drizzle-audit.store.js';

function requireOrganizationId(context: AuthorizationContext): string {
  if (context.organizationId === undefined) {
    throw AppError.forbidden('Organization scope is required');
  }
  return context.organizationId;
}

export class AuditRepository {
  constructor(private readonly store: DrizzleAuditStore) {}

  listTypes(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.listAuditTypes(requireOrganizationId(context));
  }

  list(context: AuthorizationContext, status?: string) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.listAudits(requireOrganizationId(context), status);
  }

  get(context: AuthorizationContext, auditId: string) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.getAudit(requireOrganizationId(context), auditId);
  }

  create(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleAuditStore['createAudit']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.AUDIT_CREATE);
    return this.store.createAudit({
      ...input,
      organizationId: requireOrganizationId(context),
      createdBy: context.userId ?? null,
      updatedBy: context.userId ?? null,
    });
  }

  update(
    context: AuthorizationContext,
    auditId: string,
    patch: Parameters<DrizzleAuditStore['updateAudit']>[2],
  ) {
    requirePermission(context, PERMISSIONS.AUDIT_UPDATE);
    return this.store.updateAudit(requireOrganizationId(context), auditId, {
      ...patch,
      updatedBy: context.userId ?? null,
    });
  }

  dashboardCounts(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.dashboardCounts(requireOrganizationId(context));
  }

  listUpcoming(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.listUpcoming(requireOrganizationId(context));
  }
}
