import type { OrganizationId, UserId } from '@workspace/domain/shared';
import type { Permission } from '@workspace/platform/permissions';

/** Effective permission set materialised at session creation time. */
export interface ResolvedPermissions {
  readonly permissions: ReadonlySet<Permission>;
  readonly resolvedAt: Date;
}

/**
 * Resolves the flat permission catalogue for a user in an organisation.
 *
 * The result is cached on the session so request handling performs set lookups
 * rather than graph traversal. Role inheritance and deny overrides are applied
 * here, not at individual `can()` checks.
 */
export interface PermissionResolver {
  resolveForUser(
    userId: UserId,
    organizationId: OrganizationId,
  ): Promise<ResolvedPermissions>;
}
