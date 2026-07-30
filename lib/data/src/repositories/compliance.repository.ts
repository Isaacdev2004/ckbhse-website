import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { DrizzleComplianceStore } from '../stores/drizzle-compliance.store.js';

function requireOrganizationId(context: AuthorizationContext): string {
  if (context.organizationId === undefined) {
    throw AppError.forbidden('Organization scope is required');
  }
  return context.organizationId;
}

export class InspectionRepository {
  constructor(private readonly store: DrizzleComplianceStore) {}

  listTypes(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.INSPECTION_READ);
    return this.store.listInspectionTypes(requireOrganizationId(context));
  }

  list(context: AuthorizationContext, status?: string) {
    requirePermission(context, PERMISSIONS.INSPECTION_READ);
    return this.store.listInspections(requireOrganizationId(context), status);
  }

  get(context: AuthorizationContext, inspectionId: string) {
    requirePermission(context, PERMISSIONS.INSPECTION_READ);
    return this.store.getInspection(requireOrganizationId(context), inspectionId);
  }

  create(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleComplianceStore['createInspection']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.INSPECTION_CREATE);
    return this.store.createInspection({
      ...input,
      organizationId: requireOrganizationId(context),
      createdBy: context.userId ?? null,
      updatedBy: context.userId ?? null,
    });
  }

  update(
    context: AuthorizationContext,
    inspectionId: string,
    patch: Parameters<DrizzleComplianceStore['updateInspection']>[2],
  ) {
    requirePermission(context, PERMISSIONS.INSPECTION_UPDATE);
    return this.store.updateInspection(requireOrganizationId(context), inspectionId, {
      ...patch,
      updatedBy: context.userId ?? null,
    });
  }

  dashboardCounts(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.INSPECTION_READ);
    return this.store.inspectionDashboardCounts(requireOrganizationId(context));
  }

  listUpcoming(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.INSPECTION_READ);
    return this.store.listUpcomingInspections(requireOrganizationId(context));
  }

  listToday(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.INSPECTION_READ);
    return this.store.listTodaysInspections(requireOrganizationId(context));
  }

  listFindings(context: AuthorizationContext, inspectionId: string) {
    requirePermission(context, PERMISSIONS.INSPECTION_READ);
    return this.store.listInspectionFindings(inspectionId);
  }

  createFinding(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleComplianceStore['createInspectionFinding']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.INSPECTION_CONDUCT);
    return this.store.createInspectionFinding({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }

  listEvidence(context: AuthorizationContext, inspectionId: string) {
    requirePermission(context, PERMISSIONS.INSPECTION_READ);
    return this.store.listInspectionEvidence(inspectionId);
  }

  createEvidence(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleComplianceStore['createInspectionEvidence']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.EVIDENCE_UPLOAD);
    return this.store.createInspectionEvidence({
      ...input,
      organizationId: requireOrganizationId(context),
      capturedBy: context.userId ?? null,
    });
  }

  listChecklist(context: AuthorizationContext, inspectionId: string) {
    requirePermission(context, PERMISSIONS.INSPECTION_READ);
    return this.store.listInspectionChecklist(inspectionId);
  }

  saveChecklist(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleComplianceStore['upsertInspectionChecklist']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.CHECKLIST_MANAGE);
    return this.store.upsertInspectionChecklist({
      ...input,
      organizationId: requireOrganizationId(context),
      respondedBy: context.userId ?? null,
      respondedAt: new Date(),
    });
  }
}

export class LegalRegisterRepository {
  constructor(private readonly store: DrizzleComplianceStore) {}

  list(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.LEGAL_REGISTER_READ);
    return this.store.listLegalRegister(requireOrganizationId(context));
  }

  get(context: AuthorizationContext, id: string) {
    requirePermission(context, PERMISSIONS.LEGAL_REGISTER_READ);
    return this.store.getLegalEntry(requireOrganizationId(context), id);
  }

  create(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleComplianceStore['createLegalEntry']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.LEGAL_REGISTER_MANAGE);
    return this.store.createLegalEntry({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }
}

export class RegulatoryRepository {
  constructor(private readonly store: DrizzleComplianceStore) {}

  list(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REGULATORY_READ);
    return this.store.listRegulatory(requireOrganizationId(context));
  }
}

export class ControlRepository {
  constructor(private readonly store: DrizzleComplianceStore) {}

  list(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.CONTROL_READ);
    return this.store.listControls(requireOrganizationId(context));
  }

  create(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleComplianceStore['createControl']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.CONTROL_MANAGE);
    return this.store.createControl({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }
}

export class ComplianceCalendarRepository {
  constructor(private readonly store: DrizzleComplianceStore) {}

  list(context: AuthorizationContext, from?: Date, to?: Date) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    return this.store.listCalendarEvents(requireOrganizationId(context), from, to);
  }

  create(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleComplianceStore['createCalendarEvent']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_MANAGE);
    return this.store.createCalendarEvent({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }
}

export class ComplianceRepository {
  constructor(private readonly store: DrizzleComplianceStore) {}

  listScoreConfigs(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    return this.store.listScoreConfigs(requireOrganizationId(context));
  }

  listIsoFrameworks(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    return this.store.listIsoFrameworks(requireOrganizationId(context));
  }

  async listIsoClauses(context: AuthorizationContext, frameworkId: string) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    const frameworks = await this.store.listIsoFrameworks(requireOrganizationId(context));
    if (!frameworks.some((f) => f.id === frameworkId)) {
      throw AppError.notFound('Framework not found');
    }
    return this.store.listIsoClauses(frameworkId);
  }
}

export class ComplianceAnalyticsRepository {
  constructor(private readonly store: DrizzleComplianceStore) {}

  listKpiSnapshots(context: AuthorizationContext, limit?: number) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    return this.store.listKpiSnapshots(requireOrganizationId(context), limit);
  }

  upsertKpiSnapshot(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleComplianceStore['upsertKpiSnapshot']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_MANAGE);
    return this.store.upsertKpiSnapshot({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }

  listAlerts(context: AuthorizationContext, status?: string) {
    requirePermission(context, PERMISSIONS.REGULATORY_READ);
    return this.store.listRegulatoryAlerts(requireOrganizationId(context), status);
  }

  acknowledgeAlert(context: AuthorizationContext, alertId: string) {
    requirePermission(context, PERMISSIONS.REGULATORY_MANAGE);
    return this.store.acknowledgeRegulatoryAlert(
      requireOrganizationId(context),
      alertId,
      context.userId ?? null,
    );
  }

  listExports(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_READ);
    return this.store.listExportJobs(requireOrganizationId(context));
  }

  createExport(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleComplianceStore['createExportJob']>[0], 'organizationId' | 'requestedBy'>,
  ) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_MANAGE);
    return this.store.createExportJob({
      ...input,
      organizationId: requireOrganizationId(context),
      requestedBy: context.userId ?? null,
    });
  }

  completeExport(context: AuthorizationContext, jobId: string, fileKey: string) {
    requirePermission(context, PERMISSIONS.COMPLIANCE_MANAGE);
    return this.store.completeExportJob(requireOrganizationId(context), jobId, fileKey);
  }

  controlEffectiveness(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.CONTROL_READ);
    return this.store.controlEffectivenessStats(requireOrganizationId(context));
  }

  regulatoryMonitoring(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.REGULATORY_READ);
    return this.store.regulatoryMonitoringStats(requireOrganizationId(context));
  }
}
