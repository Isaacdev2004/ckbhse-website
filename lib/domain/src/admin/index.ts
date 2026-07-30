export interface AdminDashboardData {
  readonly organizationCount: number;
  readonly userCount: number;
  readonly activeUserCount: number;
  readonly auditLogCount24h: number;
  readonly openOutboxJobs: number;
}

export interface AdminOrganizationSummary {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly status: string;
  readonly type: string;
  readonly createdAt: string;
}

export interface AdminUserSummary {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly status: string;
  readonly roles: readonly string[];
}

export interface AdminRoleSummary {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
  readonly isSystem: boolean;
}

export interface AdminPermissionSummary {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly domain: string;
}

export interface PlatformAuditLogEntry {
  readonly id: string;
  readonly organizationId: string | null;
  readonly entity: string;
  readonly entityId: string;
  readonly action: string;
  readonly eventType: string;
  readonly severity: string;
  readonly actorUserId: string | null;
  readonly actorKind: string;
  readonly requestId: string;
  readonly occurredAt: string;
  readonly previousValues: unknown;
  readonly newValues: unknown;
}

export interface AdminFeatureFlagRow {
  readonly id: string;
  readonly key: string;
  readonly enabled: boolean;
  readonly description: string | null;
  readonly organizationId: string | null;
}
