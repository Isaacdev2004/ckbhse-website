import {
  asOrganizationId,
  asUserId,
} from '@workspace/domain/shared';
import type { Database } from '@workspace/db';
import { roles, userRoles } from '@workspace/db/schema';
import { and, eq, isNull, or } from 'drizzle-orm';
import type {
  ResolvedRoleAssignment,
  RoleResolver,
  RoleScopeType,
} from '../roles/role-resolver.interface.js';

function toScopeType(value: string): RoleScopeType {
  if (
    value === 'platform' ||
    value === 'organization' ||
    value === 'project' ||
    value === 'site'
  ) {
    return value;
  }
  return 'organization';
}

export class DatabaseRoleResolver implements RoleResolver {
  constructor(private readonly db: Database) {}

  async resolveForUser(
    userId: ReturnType<typeof asUserId>,
    organizationId: ReturnType<typeof asOrganizationId>,
  ): Promise<readonly ResolvedRoleAssignment[]> {
    const rows = await this.db
      .select({
        roleKey: roles.key,
        roleName: roles.name,
        scopeType: userRoles.scopeType,
        scopeId: userRoles.scopeId,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          or(
            eq(userRoles.organizationId, organizationId),
            isNull(userRoles.organizationId),
          ),
        ),
      );

    return rows.map(
      (row): ResolvedRoleAssignment => ({
        roleKey: row.roleKey,
        roleName: row.roleName,
        scopeType: toScopeType(row.scopeType),
        scopeId: row.scopeId,
      }),
    );
  }
}
