/**
 * The authorization context: who is acting, on behalf of which tenant, with
 * which permissions, on which request.
 *
 * This is the single object every repository, service and job receives. Two
 * rules make it load-bearing rather than decorative:
 *
 *  1. Tenant scope is read from *here*, never from a request parameter. A route
 *     that accepted an organisation id could be given the wrong one; a context
 *     derived from the session cannot.
 *  2. Permission checks resolve catalogue permissions, never role names
 *     (Document 03.5 section 10.1). `roles` is carried for audit and display
 *     only and is deliberately not consulted by `can()`.
 */

import { AppError } from '../errors/index.js';
import type { Permission } from '../permissions/index.js';

/** Opaque identifier types, so an organisation id cannot be passed as a user id. */
export type UserId = string & { readonly __brand: 'UserId' };
export type OrganizationId = string & { readonly __brand: 'OrganizationId' };
export type SessionId = string & { readonly __brand: 'SessionId' };

export function asUserId(value: string): UserId {
  return value as UserId;
}
export function asOrganizationId(value: string): OrganizationId {
  return value as OrganizationId;
}
export function asSessionId(value: string): SessionId {
  return value as SessionId;
}

/**
 * How the caller was identified. Determines what a repository is willing to do:
 * `system` bypasses tenant scoping and therefore may only be constructed
 * deliberately, by background jobs and migrations.
 */
export type ActorKind = 'user' | 'service' | 'system' | 'anonymous';

export interface RequestMetadata {
  /** Correlates logs, audit entries and error responses for one request. */
  readonly requestId: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface AuthorizationContext {
  readonly actorKind: ActorKind;
  readonly userId?: UserId;
  /**
   * The tenant this request acts within. Present for every authenticated user
   * context; absent for anonymous and system contexts.
   *
   * Under single-organisation tenancy (Document 03) the organisation *is* the
   * tenant. There is no separate `tenantId` field because a second identifier
   * would invent a distinction the data model does not have — callers that want
   * the name "tenant" should use {@link getTenantId}.
   */
  readonly organizationId?: OrganizationId;
  readonly sessionId?: SessionId;
  /** Display and audit only. Never the basis of an access decision. */
  readonly roles: readonly string[];
  readonly permissions: ReadonlySet<Permission>;
  /**
   * Request correlation. `metadata.requestId` is the value echoed in error
   * responses and audit rows so a support ticket, a log line and an audit entry
   * for the same interaction can be joined.
   */
  readonly metadata: RequestMetadata;
}

/**
 * The tenant identifier for this context.
 *
 * Alias for `organizationId`. Exists so call sites that think in "tenant"
 * language — search scopes, storage key prefixes, feature-flag targeting — do
 * not invent a parallel field that drifts from the organisation id.
 */
export function getTenantId(
  context: AuthorizationContext,
): OrganizationId | undefined {
  return context.organizationId;
}

export interface CreateUserContextInput {
  readonly userId: UserId;
  readonly organizationId: OrganizationId;
  readonly sessionId?: SessionId;
  readonly roles?: readonly string[];
  readonly permissions: readonly Permission[];
  readonly metadata: RequestMetadata;
}

export function createUserContext(
  input: CreateUserContextInput,
): AuthorizationContext {
  return Object.freeze({
    actorKind: 'user' as const,
    userId: input.userId,
    organizationId: input.organizationId,
    ...(input.sessionId !== undefined ? { sessionId: input.sessionId } : {}),
    roles: Object.freeze([...(input.roles ?? [])]),
    permissions: new Set(input.permissions),
    metadata: input.metadata,
  });
}

/**
 * An unauthenticated caller. Carries no tenant and no permissions, so any
 * repository call that requires either fails closed.
 */
export function createAnonymousContext(
  metadata: RequestMetadata,
): AuthorizationContext {
  return Object.freeze({
    actorKind: 'anonymous' as const,
    roles: Object.freeze([]),
    permissions: new Set<Permission>(),
    metadata,
  });
}

/**
 * A trusted internal caller that is exempt from tenant scoping.
 *
 * Reserved for background jobs, migrations and scheduled tasks that legitimately
 * span tenants. It must never be constructed from anything a request influences,
 * and every use is audited with `actorKind: 'system'` so it is greppable in the
 * audit log.
 */
export function createSystemContext(
  metadata: RequestMetadata,
  reason: string,
): AuthorizationContext {
  if (reason.trim() === '') {
    throw AppError.internal(
      'A system authorization context requires a stated reason',
    );
  }

  return Object.freeze({
    actorKind: 'system' as const,
    roles: Object.freeze(['system']),
    // A system context holds no permissions: it is exempt from *tenant*
    // scoping, not from permission checks. Anything needing a permission must
    // be granted it explicitly rather than inheriting a blanket allowance.
    permissions: new Set<Permission>(),
    metadata,
  });
}

// --- Queries -----------------------------------------------------------------

export function isAuthenticated(context: AuthorizationContext): boolean {
  return context.actorKind === 'user' || context.actorKind === 'service';
}

export function can(
  context: AuthorizationContext,
  permission: Permission,
): boolean {
  return context.permissions.has(permission);
}

export function canAll(
  context: AuthorizationContext,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => can(context, permission));
}

export function canAny(
  context: AuthorizationContext,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => can(context, permission));
}

/**
 * Assert a permission, throwing the correct error for the caller's state.
 *
 * The distinction matters: an anonymous caller gets 401 so the client knows to
 * authenticate, while an authenticated caller gets 403 because retrying with the
 * same credentials will not help.
 */
export function requirePermission(
  context: AuthorizationContext,
  permission: Permission,
): void {
  if (can(context, permission)) return;

  if (!isAuthenticated(context) && context.actorKind !== 'system') {
    throw AppError.unauthorized();
  }

  throw AppError.forbidden();
}

export function requireAllPermissions(
  context: AuthorizationContext,
  permissions: readonly Permission[],
): void {
  for (const permission of permissions) {
    requirePermission(context, permission);
  }
}

/**
 * Resolve the tenant a repository must scope to.
 *
 * Returns `null` for a system context, which is the documented signal that
 * scoping is intentionally bypassed. Throws for anonymous callers, so an
 * unauthenticated request can never read tenant data by omission.
 */
export function resolveTenantScope(
  context: AuthorizationContext,
): OrganizationId | null {
  if (context.actorKind === 'system') return null;

  if (context.organizationId === undefined) {
    throw AppError.unauthorized(
      'This operation requires an organisation-scoped session',
    );
  }

  return context.organizationId;
}

/**
 * Whether this context may deliberately read across tenants, which requires
 * both the platform permission and an explicit route-level decision.
 */
export function canCrossTenantBoundary(
  context: AuthorizationContext,
  permission: Permission,
): boolean {
  return context.actorKind === 'system' || can(context, permission);
}
