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

export class CertificateRepository {
  constructor(private readonly store: DrizzleLearningStore) {}

  list(context: AuthorizationContext, userId?: string) {
    requirePermission(context, PERMISSIONS.CERTIFICATE_READ);
    return this.store.listCertificates(requireOrganizationId(context), userId);
  }

  get(context: AuthorizationContext, certificateId: string) {
    requirePermission(context, PERMISSIONS.CERTIFICATE_READ);
    return this.store.getCertificate(
      requireOrganizationId(context),
      certificateId,
    );
  }

  issue(
    context: AuthorizationContext,
    input: Omit<Parameters<DrizzleLearningStore['createCertificate']>[0], 'organizationId'>,
  ) {
    requirePermission(context, PERMISSIONS.CERTIFICATE_ISSUE);
    return this.store.createCertificate({
      ...input,
      organizationId: requireOrganizationId(context),
    });
  }

  countExpiring(context: AuthorizationContext, withinDays?: number) {
    requirePermission(context, PERMISSIONS.CERTIFICATE_READ);
    return this.store.countExpiringCertificates(
      requireOrganizationId(context),
      withinDays,
    );
  }
}
