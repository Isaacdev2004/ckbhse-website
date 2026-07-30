import { describe, expect, it } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { ROLE_PERMISSION_SEED } from './permissions-seed.js';
import { expandRoleKeys } from './role-inheritance.js';

describe('M2.4 client portal RBAC seed', () => {
  it('seeds compliance_manager role permissions with portal access', () => {
    const rows = ROLE_PERMISSION_SEED.filter(
      (row) => row.roleKey === 'compliance_manager',
    );
    expect(rows.some((row) => row.permissionKey === PERMISSIONS.PORTAL_ACCESS)).toBe(
      true,
    );
  });

  it('seeds viewer role permissions', () => {
    const rows = ROLE_PERMISSION_SEED.filter((row) => row.roleKey === 'viewer');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('inherits client_user for department_manager', () => {
    const expanded = expandRoleKeys(['department_manager']);
    expect(expanded.has('client_user')).toBe(true);
  });

  it('inherits viewer for external_contractor', () => {
    const expanded = expandRoleKeys(['external_contractor']);
    expect(expanded.has('viewer')).toBe(true);
    expect(expanded.has('client_user')).toBe(true);
  });
});
