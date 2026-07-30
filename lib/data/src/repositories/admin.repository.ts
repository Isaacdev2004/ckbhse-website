import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { FeatureFlagRepository } from './feature-flag.repository.js';
import type {
  AuditLogSearchFilters,
  DrizzleAdminStore,
} from '../stores/drizzle-admin.store.js';

function requireAdminAccess(context: AuthorizationContext) {
  requirePermission(context, PERMISSIONS.ADMIN_ACCESS);
}

function requireOrganizationId(context: AuthorizationContext): string | undefined {
  return context.organizationId;
}

function assertCrossTenantAccess(context: AuthorizationContext) {
  requirePermission(context, PERMISSIONS.TENANT_VIEW_ALL);
}

export class AdminRepository {
  constructor(
    private readonly store: DrizzleAdminStore,
    private readonly featureFlags: FeatureFlagRepository,
  ) {}

  async dashboardCounts(context: AuthorizationContext) {
    requireAdminAccess(context);
    assertCrossTenantAccess(context);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [organizationCount, userCount, activeUserCount, auditLogCount24h, openOutboxJobs] =
      await Promise.all([
        this.store.countOrganizations(),
        this.store.countUsers(),
        this.store.countActiveUsers(),
        this.store.countAuditLogsSince(since),
        this.store.countPendingOutbox(),
      ]);
    return {
      organizationCount,
      userCount,
      activeUserCount,
      auditLogCount24h,
      openOutboxJobs,
    };
  }

  listOrganizations(context: AuthorizationContext, limit?: number) {
    requireAdminAccess(context);
    assertCrossTenantAccess(context);
    return this.store.listOrganizations(limit);
  }

  listUsers(context: AuthorizationContext, keyword?: string, limit?: number) {
    requirePermission(context, PERMISSIONS.USER_READ);
    assertCrossTenantAccess(context);
    return this.store.listUsers(limit, keyword);
  }

  listRoles(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.ROLE_READ);
    return this.store.listRoles();
  }

  listPermissions(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.PERMISSION_READ);
    return this.store.listPermissions();
  }

  searchAuditLogs(context: AuthorizationContext, filters: AuditLogSearchFilters = {}) {
    requirePermission(context, PERMISSIONS.AUDIT_LOG_READ);
    if (filters.organizationId && !context.permissions.has(PERMISSIONS.TENANT_VIEW_ALL)) {
      const orgId = requireOrganizationId(context);
      if (orgId !== filters.organizationId) {
        throw AppError.forbidden('Cross-tenant audit log access denied');
      }
    }
    if (!context.permissions.has(PERMISSIONS.TENANT_VIEW_ALL)) {
      const orgId = requireOrganizationId(context);
      if (!orgId) {
        throw AppError.forbidden('Organization scope is required');
      }
      return this.store.searchAuditLogs({ ...filters, organizationId: orgId });
    }
    return this.store.searchAuditLogs(filters);
  }

  listFeatureFlags(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.FEATURE_FLAG_MANAGE);
    return this.store.listFeatureFlags();
  }

  async setFeatureFlag(
    context: AuthorizationContext,
    key: string,
    input: { enabled: boolean; description?: string | null },
  ) {
    requirePermission(context, PERMISSIONS.FEATURE_FLAG_MANAGE);
    await this.featureFlags.set(key, {
      enabled: input.enabled,
      description: input.description ?? null,
      organizationId: null,
    });
    return this.store.getGlobalFeatureFlag(key);
  }
}
