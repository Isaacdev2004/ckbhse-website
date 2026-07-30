import type { OrganizationId, UserId } from '@workspace/domain/shared';

/** A role assignment resolved for a user within an organisation scope. */
export interface ResolvedRoleAssignment {
  readonly roleKey: string;
  readonly roleName: string;
  readonly scopeType: RoleScopeType;
  readonly scopeId: string | null;
}

/**
 * Scope granularity for a role assignment.
 *
 * Platform-wide roles use `platform`; project-scoped consultant access uses
 * `project` with a concrete project id.
 */
export type RoleScopeType = 'platform' | 'organization' | 'project' | 'site';

/**
 * Resolves role assignments for session construction and display.
 *
 * Role keys are carried on {@link AuthorizationContext.roles} for audit and UI
 * only — access decisions must never branch on role names.
 */
export interface RoleResolver {
  resolveForUser(
    userId: UserId,
    organizationId: OrganizationId,
  ): Promise<readonly ResolvedRoleAssignment[]>;
}
