import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { DrizzleCapaStore } from '../stores/drizzle-capa.store.js';

function requireOrganizationId(context: AuthorizationContext): string {
  if (context.organizationId === undefined) {
    throw AppError.forbidden('Organization scope is required');
  }
  return context.organizationId;
}

export class CapaRepository {
  constructor(private readonly store: DrizzleCapaStore) {}

  list(context: AuthorizationContext, status?: string) {
    requirePermission(context, PERMISSIONS.CAPA_READ);
    return this.store.listCapa(requireOrganizationId(context), status);
  }

  get(context: AuthorizationContext, capaId: string) {
    requirePermission(context, PERMISSIONS.CAPA_READ);
    return this.store.getCapa(requireOrganizationId(context), capaId);
  }

  async create(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleCapaStore['createCapa']>[0], 'organizationId' | 'capaNumber'>,
  ) {
    requirePermission(context, PERMISSIONS.CAPA_CREATE);
    const orgId = requireOrganizationId(context);
    const capaNumber = await this.store.nextCapaNumber(orgId);
    return this.store.createCapa({
      ...input,
      organizationId: orgId,
      capaNumber,
      createdBy: context.userId ?? null,
      updatedBy: context.userId ?? null,
    });
  }

  update(
    context: AuthorizationContext,
    capaId: string,
    patch: Parameters<DrizzleCapaStore['updateCapa']>[2],
  ) {
    requirePermission(context, PERMISSIONS.CAPA_UPDATE);
    return this.store.updateCapa(requireOrganizationId(context), capaId, {
      ...patch,
      updatedBy: context.userId ?? null,
    });
  }

  dashboardCounts(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.CAPA_READ);
    return this.store.dashboardCounts(requireOrganizationId(context));
  }

  getRca(context: AuthorizationContext, capaId: string) {
    requirePermission(context, PERMISSIONS.CAPA_READ);
    return this.store.getRca(capaId);
  }

  upsertRca(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleCapaStore['upsertRca']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.CAPA_UPDATE);
    return this.store.upsertRca({
      ...input,
      organizationId: requireOrganizationId(context),
      completedBy: context.userId ?? null,
      completedAt: new Date(),
    });
  }

  listVerifications(context: AuthorizationContext, capaId: string) {
    requirePermission(context, PERMISSIONS.CAPA_READ);
    return this.store.listVerifications(capaId);
  }

  createVerification(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleCapaStore['createVerification']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.CAPA_VERIFY);
    return this.store.createVerification({
      ...input,
      organizationId: requireOrganizationId(context),
      verifiedBy: context.userId ?? null,
      verifiedAt: new Date(),
    });
  }

  listApprovals(context: AuthorizationContext, capaId: string) {
    requirePermission(context, PERMISSIONS.CAPA_READ);
    return this.store.listApprovals(capaId);
  }

  createApproval(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleCapaStore['createApproval']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.CAPA_APPROVE);
    return this.store.createApproval({
      ...input,
      organizationId: requireOrganizationId(context),
      approvedBy: context.userId ?? null,
      approvedAt: new Date(),
      status: 'approved',
    });
  }

  listEscalations(context: AuthorizationContext, capaId: string) {
    requirePermission(context, PERMISSIONS.CAPA_READ);
    return this.store.listEscalations(capaId);
  }

  createEscalation(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleCapaStore['createEscalation']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.CAPA_ESCALATE);
    return this.store.createEscalation({
      ...input,
      organizationId: requireOrganizationId(context),
      createdBy: context.userId ?? null,
    });
  }

  createNotification(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleCapaStore['createNotification']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.CAPA_READ);
    return this.store.createNotification({
      ...input,
      organizationId: requireOrganizationId(context),
      deliveryStatus: 'pending',
    });
  }

  listNotifications(context: AuthorizationContext, capaId: string) {
    requirePermission(context, PERMISSIONS.CAPA_READ);
    return this.store.listNotifications(capaId);
  }
}
