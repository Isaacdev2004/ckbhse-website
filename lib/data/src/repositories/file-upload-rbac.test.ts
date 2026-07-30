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

describe('file upload RBAC seed', () => {
  it('grants document read to client portal users', () => {
    const client = permissionsForRole('client_user');
    expect(client).toContain(PERMISSIONS.DOCUMENT_READ);
  });

  it('grants evidence upload to field consultants', () => {
    const consultant = permissionsForRole('consultant');
    expect(consultant).toContain(PERMISSIONS.EVIDENCE_UPLOAD);
  });

  it('grants evidence upload to managers via consultant inheritance', () => {
    const manager = permissionsForRole('manager');
    expect(manager).toContain(PERMISSIONS.EVIDENCE_UPLOAD);
  });

  it('registers file permissions in catalogue', () => {
    expect(ALL_PERMISSIONS).toContain(PERMISSIONS.DOCUMENT_READ);
    expect(ALL_PERMISSIONS).toContain(PERMISSIONS.DOCUMENT_MANAGE);
    expect(ALL_PERMISSIONS).toContain(PERMISSIONS.EVIDENCE_UPLOAD);
  });
});
