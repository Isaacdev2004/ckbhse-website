import type { AdminRepository } from '@workspace/data/repositories/admin';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { SystemService } from '../system/system.service.js';
import type {
  AdminDashboardData,
  AdminFeatureFlagRow,
  AdminOrganizationSummary,
  AdminPermissionSummary,
  AdminRoleSummary,
  AdminUserSummary,
  PlatformAuditLogEntry,
} from '@workspace/domain/admin';

export class AdminService {
  constructor(
    private readonly admin: AdminRepository,
    private readonly system: SystemService,
  ) {}

  async getDashboard(context: AuthorizationContext): Promise<AdminDashboardData> {
    return this.admin.dashboardCounts(context);
  }

  async listOrganizations(context: AuthorizationContext): Promise<AdminOrganizationSummary[]> {
    const rows = await this.admin.listOrganizations(context);
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      status: row.status,
      type: row.type,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async listUsers(
    context: AuthorizationContext,
    keyword?: string,
  ): Promise<AdminUserSummary[]> {
    const rows = await this.admin.listUsers(context, keyword);
    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      status: row.status,
      roles: row.roles,
    }));
  }

  async listRoles(context: AuthorizationContext): Promise<AdminRoleSummary[]> {
    const rows = await this.admin.listRoles(context);
    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      name: row.name,
      description: row.description,
      isSystem: row.isSystem,
    }));
  }

  async listPermissions(context: AuthorizationContext): Promise<AdminPermissionSummary[]> {
    const rows = await this.admin.listPermissions(context);
    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      name: row.name,
      domain: row.domain,
    }));
  }

  async searchAuditLogs(
    context: AuthorizationContext,
    filters: {
      organizationId?: string;
      entity?: string;
      entityId?: string;
      actorUserId?: string;
      requestId?: string;
      action?: string;
      limit?: number;
    } = {},
  ): Promise<PlatformAuditLogEntry[]> {
    const rows = await this.admin.searchAuditLogs(context, filters);
    return rows.map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      entity: row.entity,
      entityId: row.entityId,
      action: row.action,
      eventType: row.eventType,
      severity: row.severity,
      actorUserId: row.actorUserId,
      actorKind: row.actorKind,
      requestId: row.requestId,
      occurredAt: row.occurredAt.toISOString(),
      previousValues: row.previousValues,
      newValues: row.newValues,
    }));
  }

  async listFeatureFlags(context: AuthorizationContext): Promise<AdminFeatureFlagRow[]> {
    const rows = await this.admin.listFeatureFlags(context);
    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      enabled: row.enabled,
      description: row.description,
      organizationId: row.organizationId,
    }));
  }

  async updateFeatureFlag(
    context: AuthorizationContext,
    key: string,
    input: { enabled: boolean; description?: string | null },
  ) {
    const row = await this.admin.setFeatureFlag(context, key, input);
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      key: row.key,
      enabled: row.enabled,
      description: row.description,
      organizationId: row.organizationId,
    } satisfies AdminFeatureFlagRow;
  }

  getSystemHealth(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.SYSTEM_READ);
    return this.system.getHealth();
  }

  getSystemVersion(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.SYSTEM_READ);
    return this.system.getVersionInfo();
  }
}

export function createAdminService(deps: {
  admin: AdminRepository;
  system: SystemService;
}) {
  return new AdminService(deps.admin, deps.system);
}
