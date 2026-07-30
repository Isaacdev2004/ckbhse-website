import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { DrizzleRiskStore } from '../stores/drizzle-risk.store.js';

function requireOrganizationId(context: AuthorizationContext): string {
  if (context.organizationId === undefined) {
    throw AppError.forbidden('Organization scope is required');
  }
  return context.organizationId;
}

export class RiskRepository {
  constructor(private readonly store: DrizzleRiskStore) {}

  listAssessments(context: AuthorizationContext, status?: string) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.listAssessments(requireOrganizationId(context), status);
  }

  getAssessment(context: AuthorizationContext, assessmentId: string) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.getAssessment(requireOrganizationId(context), assessmentId);
  }

  async createAssessment(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleRiskStore['createAssessment']>[0], 'organizationId' | 'assessmentNumber'>,
  ) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    const orgId = requireOrganizationId(context);
    const assessmentNumber = await this.store.nextAssessmentNumber(orgId);
    return this.store.createAssessment({
      ...input,
      organizationId: orgId,
      assessmentNumber,
      createdBy: context.userId ?? null,
      updatedBy: context.userId ?? null,
    });
  }

  updateAssessment(
    context: AuthorizationContext,
    assessmentId: string,
    patch: Parameters<DrizzleRiskStore['updateAssessment']>[2],
  ) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    return this.store.updateAssessment(requireOrganizationId(context), assessmentId, {
      ...patch,
      updatedBy: context.userId ?? null,
    });
  }

  listHazards(context: AuthorizationContext, assessmentId?: string) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.listHazards(requireOrganizationId(context), assessmentId);
  }

  getHazard(context: AuthorizationContext, hazardId: string) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.getHazard(requireOrganizationId(context), hazardId);
  }

  async createHazard(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleRiskStore['createHazard']>[0], 'organizationId' | 'hazardNumber'>,
  ) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    const orgId = requireOrganizationId(context);
    const hazardNumber = await this.store.nextHazardNumber(orgId);
    return this.store.createHazard({
      ...input,
      organizationId: orgId,
      hazardNumber,
      createdBy: context.userId ?? null,
      updatedBy: context.userId ?? null,
    });
  }

  updateHazard(
    context: AuthorizationContext,
    hazardId: string,
    patch: Parameters<DrizzleRiskStore['updateHazard']>[2],
  ) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    return this.store.updateHazard(requireOrganizationId(context), hazardId, {
      ...patch,
      updatedBy: context.userId ?? null,
    });
  }

  getDefaultMatrix(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.getDefaultMatrix(requireOrganizationId(context));
  }

  listMatrices(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.listMatrices(requireOrganizationId(context));
  }

  listTreatments(context: AuthorizationContext, assessmentId: string) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.listTreatments(requireOrganizationId(context), assessmentId);
  }

  createTreatment(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleRiskStore['createTreatment']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    return this.store.createTreatment({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }

  listReviews(context: AuthorizationContext, assessmentId: string) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.listReviews(requireOrganizationId(context), assessmentId);
  }

  createReview(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleRiskStore['createReview']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    return this.store.createReview({
      ...input,
      organizationId: requireOrganizationId(context),
      reviewedBy: context.userId ?? null,
    });
  }

  listBowtieElements(context: AuthorizationContext, assessmentId: string) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.listBowtieElements(requireOrganizationId(context), assessmentId);
  }

  createBowtieElement(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleRiskStore['createBowtieElement']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_MANAGE);
    return this.store.createBowtieElement({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }

  dashboardCounts(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.dashboardCounts(requireOrganizationId(context));
  }

  heatMapData(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.RISK_ASSESSMENT_READ);
    return this.store.heatMapData(requireOrganizationId(context));
  }
}
