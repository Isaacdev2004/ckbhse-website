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

export class FindingRepository {
  constructor(private readonly store: DrizzleAuditStore) {}

  list(context: AuthorizationContext, auditId: string) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.listFindings(auditId);
  }

  create(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleAuditStore['createFinding']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.AUDIT_CONDUCT);
    return this.store.createFinding({
      ...input,
      organizationId: requireOrganizationId(context),
      raisedBy: context.userId ?? null,
    });
  }
}

export class AuditTemplateRepository {
  constructor(private readonly store: DrizzleAuditStore) {}

  list(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.listTemplates(requireOrganizationId(context));
  }

  async getDetail(context: AuthorizationContext, templateId: string) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    const orgId = requireOrganizationId(context);
    const template = await this.store.getTemplate(orgId, templateId);
    if (template === null) return null;
    const [sections, items] = await Promise.all([
      this.store.listTemplateSections(templateId),
      this.store.listTemplateItems(templateId),
    ]);
    return { template, sections, items };
  }
}

export class ChecklistRepository {
  constructor(private readonly store: DrizzleAuditStore) {}

  list(context: AuthorizationContext, auditId: string) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.listChecklistResponses(auditId);
  }

  saveResponse(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleAuditStore['upsertChecklistResponse']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.CHECKLIST_MANAGE);
    return this.store.upsertChecklistResponse({
      ...input,
      organizationId: requireOrganizationId(context),
      respondedBy: context.userId ?? null,
      respondedAt: new Date(),
    });
  }
}

export class EvidenceRepository {
  constructor(private readonly store: DrizzleAuditStore) {}

  list(context: AuthorizationContext, auditId: string) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.listEvidence(auditId);
  }

  create(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleAuditStore['createEvidence']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.EVIDENCE_UPLOAD);
    return this.store.createEvidence({
      ...input,
      organizationId: requireOrganizationId(context),
      capturedBy: context.userId ?? null,
    });
  }
}

export class AuditAssignmentRepository {
  constructor(private readonly store: DrizzleAuditStore) {}

  list(context: AuthorizationContext, auditId: string) {
    requirePermission(context, PERMISSIONS.AUDIT_READ);
    return this.store.listAssignments(auditId);
  }

  assign(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleAuditStore['createAssignment']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.AUDIT_ASSIGN);
    return this.store.createAssignment({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }
}
