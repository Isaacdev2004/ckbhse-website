import {
  asOrganizationId,
  asUserId,
} from '@workspace/domain/shared';
import type { Database } from '@workspace/db';
import {
  permissions,
  rolePermissions,
  roles,
  userRoles,
} from '@workspace/db/schema';
import { expandRoleKeys } from '@workspace/data/seed/role-inheritance';
import {
  isPermission,
  type Permission,
} from '@workspace/platform/permissions';
import { and, eq, inArray, isNull, or } from 'drizzle-orm';
import type {
  PermissionResolver,
  ResolvedPermissions,
} from './permission-resolver.interface.js';

export class DatabasePermissionResolver implements PermissionResolver {
  constructor(
    private readonly db: Database,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async resolveForUser(
    userId: ReturnType<typeof asUserId>,
    organizationId: ReturnType<typeof asOrganizationId>,
  ): Promise<ResolvedPermissions> {
    const assignmentRows = await this.db
      .select({ roleKey: roles.key })
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

    const roleKeys = expandRoleKeys(assignmentRows.map((row) => row.roleKey));

    if (roleKeys.size === 0) {
      return {
        permissions: new Set<Permission>(),
        resolvedAt: this.now(),
      };
    }

    const roleRows = await this.db
      .select({ id: roles.id })
      .from(roles)
      .where(inArray(roles.key, [...roleKeys]));

    const roleIds = roleRows.map((row) => row.id);
    if (roleIds.length === 0) {
      return {
        permissions: new Set<Permission>(),
        resolvedAt: this.now(),
      };
    }

    const permissionRows = await this.db
      .select({ key: permissions.key })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds));

    const resolved = new Set<Permission>();
    for (const row of permissionRows) {
      if (isPermission(row.key)) {
        resolved.add(row.key);
      }
    }

    return {
      permissions: resolved,
      resolvedAt: this.now(),
    };
  }
}
