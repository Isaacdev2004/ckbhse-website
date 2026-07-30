import {
  auditLogs,
  featureFlags,
  organizations,
  outbox,
  permissions,
  roles,
  userRoles,
  users,
} from '@workspace/db/schema';
import type { Database } from '@workspace/db';
import { and, count, desc, eq, gte, ilike, isNull, or } from 'drizzle-orm';

export interface AuditLogSearchFilters {
  readonly organizationId?: string;
  readonly entity?: string;
  readonly entityId?: string;
  readonly actorUserId?: string;
  readonly requestId?: string;
  readonly action?: string;
  readonly since?: Date;
  readonly limit?: number;
}

export class DrizzleAdminStore {
  constructor(private readonly db: Database) {}

  async countOrganizations() {
    const [row] = await this.db.select({ total: count() }).from(organizations);
    return row?.total ?? 0;
  }

  async listOrganizations(limit = 100) {
    return this.db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        status: organizations.status,
        type: organizations.type,
        createdAt: organizations.createdAt,
      })
      .from(organizations)
      .orderBy(desc(organizations.createdAt))
      .limit(limit);
  }

  async countUsers() {
    const [row] = await this.db.select({ total: count() }).from(users);
    return row?.total ?? 0;
  }

  async countActiveUsers() {
    const [row] = await this.db
      .select({ total: count() })
      .from(users)
      .where(eq(users.status, 'active'));
    return row?.total ?? 0;
  }

  async listUsers(limit = 100, keyword?: string) {
    const conditions = keyword
      ? or(
          ilike(users.email, `%${keyword}%`),
          ilike(users.firstName, `%${keyword}%`),
          ilike(users.lastName, `%${keyword}%`),
        )
      : undefined;

    const rows = await this.db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        status: users.status,
      })
      .from(users)
      .where(conditions)
      .orderBy(desc(users.createdAt))
      .limit(limit);

    const roleRows = await this.db
      .select({
        userId: userRoles.userId,
        roleKey: roles.key,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id));

    const rolesByUser = new Map<string, string[]>();
    for (const row of roleRows) {
      const existing = rolesByUser.get(row.userId) ?? [];
      existing.push(row.roleKey);
      rolesByUser.set(row.userId, existing);
    }

    return rows.map((row) => ({
      ...row,
      roles: rolesByUser.get(row.id) ?? [],
    }));
  }

  async listRoles() {
    return this.db
      .select({
        id: roles.id,
        key: roles.key,
        name: roles.name,
        description: roles.description,
        isSystem: roles.isSystem,
      })
      .from(roles)
      .orderBy(roles.key);
  }

  async listPermissions() {
    return this.db
      .select({
        id: permissions.id,
        key: permissions.key,
        name: permissions.name,
        domain: permissions.domain,
      })
      .from(permissions)
      .orderBy(permissions.domain, permissions.key);
  }

  async searchAuditLogs(filters: AuditLogSearchFilters = {}) {
    const conditions = [];
    if (filters.organizationId) {
      conditions.push(eq(auditLogs.organizationId, filters.organizationId));
    }
    if (filters.entity) {
      conditions.push(eq(auditLogs.entity, filters.entity));
    }
    if (filters.entityId) {
      conditions.push(eq(auditLogs.entityId, filters.entityId));
    }
    if (filters.actorUserId) {
      conditions.push(eq(auditLogs.actorUserId, filters.actorUserId));
    }
    if (filters.requestId) {
      conditions.push(eq(auditLogs.requestId, filters.requestId));
    }
    if (filters.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters.since) {
      conditions.push(gte(auditLogs.occurredAt, filters.since));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return this.db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.occurredAt))
      .limit(filters.limit ?? 100);
  }

  async countAuditLogsSince(since: Date) {
    const [row] = await this.db
      .select({ total: count() })
      .from(auditLogs)
      .where(gte(auditLogs.occurredAt, since));
    return row?.total ?? 0;
  }

  async listFeatureFlags() {
    return this.db
      .select()
      .from(featureFlags)
      .orderBy(featureFlags.key);
  }

  async countPendingOutbox() {
    const [row] = await this.db
      .select({ total: count() })
      .from(outbox)
      .where(
        or(eq(outbox.status, 'pending'), eq(outbox.status, 'processing')),
      );
    return row?.total ?? 0;
  }

  async getGlobalFeatureFlag(key: string) {
    const [row] = await this.db
      .select()
      .from(featureFlags)
      .where(and(eq(featureFlags.key, key), isNull(featureFlags.organizationId)))
      .limit(1);
    return row ?? null;
  }
}
