import { describe, expect, it } from 'vitest';
import {
  PERMISSIONS,
  ALL_PERMISSIONS,
} from '@workspace/platform/permissions';
import { ROLE_PERMISSION_SEED } from '../seed/permissions-seed.js';

function permissionsForRole(roleKey: string) {
  return ROLE_PERMISSION_SEED.filter((row) => row.roleKey === roleKey).map(
    (row) => row.permissionKey,
  );
}

describe('reporting RBAC seed', () => {
  it('grants read access to consultants', () => {
    const consultant = permissionsForRole('consultant');
    expect(consultant).toContain(PERMISSIONS.REPORT_READ);
    expect(consultant).not.toContain(PERMISSIONS.REPORT_MANAGE);
    expect(consultant).not.toContain(PERMISSIONS.REPORT_EXPORT);
  });

  it('grants manage, export, and personalize to managers', () => {
    const manager = permissionsForRole('manager');
    expect(manager).toContain(PERMISSIONS.REPORT_READ);
    expect(manager).toContain(PERMISSIONS.REPORT_MANAGE);
    expect(manager).toContain(PERMISSIONS.REPORT_EXPORT);
    expect(manager).toContain(PERMISSIONS.DASHBOARD_PERSONALIZE);
  });

  it('registers all reporting permissions in catalogue', () => {
    expect(ALL_PERMISSIONS).toContain(PERMISSIONS.REPORT_READ);
    expect(ALL_PERMISSIONS).toContain(PERMISSIONS.REPORT_MANAGE);
    expect(ALL_PERMISSIONS).toContain(PERMISSIONS.REPORT_EXPORT);
    expect(ALL_PERMISSIONS).toContain(PERMISSIONS.DASHBOARD_PERSONALIZE);
  });
});
