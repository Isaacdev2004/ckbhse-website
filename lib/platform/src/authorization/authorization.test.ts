import { describe, expect, it } from 'vitest';
import { PERMISSIONS, type Permission } from '../permissions/index.js';
import {
  asOrganizationId,
  asSessionId,
  asUserId,
  can,
  canAll,
  canAny,
  canCrossTenantBoundary,
  createAnonymousContext,
  createSystemContext,
  createUserContext,
  getTenantId,
  isAuthenticated,
  requirePermission,
  resolveTenantScope,
} from './index.js';

const metadata = {
  requestId: 'req-1',
  ipAddress: '203.0.113.5',
  userAgent: 'vitest',
};

function userContext(
  permissions: readonly Permission[] = [PERMISSIONS.PROJECT_READ],
) {
  return createUserContext({
    userId: asUserId('user-1'),
    organizationId: asOrganizationId('org-1'),
    sessionId: asSessionId('session-1'),
    roles: ['client_admin'],
    permissions,
    metadata,
  });
}

describe('createUserContext', () => {
  it('carries the full identity', () => {
    const context = userContext();

    expect(context.actorKind).toBe('user');
    expect(context.userId).toBe('user-1');
    expect(context.organizationId).toBe('org-1');
    expect(context.sessionId).toBe('session-1');
    expect(context.metadata.requestId).toBe('req-1');
  });

  it('is frozen so a downstream layer cannot escalate itself', () => {
    const context = userContext();
    expect(Object.isFrozen(context)).toBe(true);
  });

  it('exposes the organisation as the tenant identifier', () => {
    const context = userContext();
    expect(getTenantId(context)).toBe(context.organizationId);
    expect(getTenantId(createAnonymousContext(metadata))).toBeUndefined();
  });
});

describe('permission checks', () => {
  it('resolves permissions, not roles', () => {
    const context = userContext([PERMISSIONS.PROJECT_READ]);

    expect(context.roles).toContain('client_admin');
    // Holding a role grants nothing on its own: only the permission set counts,
    // which is what stops `if (role === 'admin')` creeping back in.
    expect(can(context, PERMISSIONS.PROJECT_MANAGE)).toBe(false);
  });

  it('evaluates all and any', () => {
    const context = userContext([
      PERMISSIONS.PROJECT_READ,
      PERMISSIONS.DOCUMENT_READ,
    ]);

    expect(
      canAll(context, [PERMISSIONS.PROJECT_READ, PERMISSIONS.DOCUMENT_READ]),
    ).toBe(true);
    expect(
      canAll(context, [PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_MANAGE]),
    ).toBe(false);
    expect(
      canAny(context, [PERMISSIONS.PROJECT_MANAGE, PERMISSIONS.DOCUMENT_READ]),
    ).toBe(true);
  });

  it('throws 403 for an authenticated caller lacking the permission', () => {
    expect(() =>
      requirePermission(userContext(), PERMISSIONS.ADMIN_ACCESS),
    ).toThrowError(expect.objectContaining({ code: 'forbidden' }));
  });

  it('throws 401 for an anonymous caller', () => {
    // Anonymous gets 401 because authenticating might help; an authenticated
    // caller gets 403 because retrying with the same credentials will not.
    expect(() =>
      requirePermission(
        createAnonymousContext(metadata),
        PERMISSIONS.PORTAL_ACCESS,
      ),
    ).toThrowError(expect.objectContaining({ code: 'unauthorized' }));
  });
});

describe('anonymous context', () => {
  it('holds no permissions and no tenant', () => {
    const context = createAnonymousContext(metadata);

    expect(isAuthenticated(context)).toBe(false);
    expect(context.permissions.size).toBe(0);
    expect(context.organizationId).toBeUndefined();
  });

  it('cannot resolve a tenant scope', () => {
    expect(() =>
      resolveTenantScope(createAnonymousContext(metadata)),
    ).toThrowError(expect.objectContaining({ code: 'unauthorized' }));
  });
});

describe('system context', () => {
  it('resolves to an unscoped query', () => {
    const context = createSystemContext(metadata, 'certificate expiry sweep');

    // Null is the explicit "all tenants" signal, distinct from a missing tenant,
    // which throws.
    expect(resolveTenantScope(context)).toBeNull();
  });

  it('requires a stated reason', () => {
    expect(() => createSystemContext(metadata, '  ')).toThrowError(
      /requires a stated reason/,
    );
  });

  it('holds no permissions of its own', () => {
    const context = createSystemContext(metadata, 'nightly rollup');

    // Exempt from tenant scoping is not the same as exempt from permissions:
    // a job still has to be granted what it needs explicitly.
    expect(context.permissions.size).toBe(0);
    expect(can(context, PERMISSIONS.ADMIN_ACCESS)).toBe(false);
  });

  it('may cross tenant boundaries', () => {
    const context = createSystemContext(metadata, 'nightly rollup');
    expect(canCrossTenantBoundary(context, PERMISSIONS.TENANT_VIEW_ALL)).toBe(
      true,
    );
  });
});

describe('resolveTenantScope', () => {
  it('returns the caller\u2019s organisation', () => {
    expect(resolveTenantScope(userContext())).toBe('org-1');
  });
});

describe('canCrossTenantBoundary', () => {
  it('requires the platform permission for a user', () => {
    expect(
      canCrossTenantBoundary(userContext(), PERMISSIONS.TENANT_VIEW_ALL),
    ).toBe(false);

    expect(
      canCrossTenantBoundary(
        userContext([PERMISSIONS.TENANT_VIEW_ALL]),
        PERMISSIONS.TENANT_VIEW_ALL,
      ),
    ).toBe(true);
  });
});
