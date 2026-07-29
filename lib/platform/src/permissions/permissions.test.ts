import { describe, expect, it } from 'vitest';
import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  isPermission,
  parsePermissions,
  permissionsByDomain,
} from './index.js';

describe('the permission catalogue', () => {
  it('contains no duplicate strings', () => {
    // Two keys sharing a permission string would make revoking one silently
    // leave the other in place.
    expect(new Set(ALL_PERMISSIONS).size).toBe(ALL_PERMISSIONS.length);
  });

  it('follows the domain.resource.action convention', () => {
    const malformed = ALL_PERMISSIONS.filter(
      (permission) => !/^[a-z][a-z-]*(\.[a-z][a-z-]*){1,3}$/.test(permission),
    );

    expect(malformed).toEqual([]);
  });

  it('separates read from write for every managed domain', () => {
    // A domain with a write permission but no read permission cannot be
    // displayed before it is edited, which is always a modelling mistake.
    expect(isPermission(PERMISSIONS.PROJECT_READ)).toBe(true);
    expect(isPermission(PERMISSIONS.PROJECT_MANAGE)).toBe(true);
    expect(isPermission(PERMISSIONS.AUDIT_READ)).toBe(true);
    expect(isPermission(PERMISSIONS.AUDIT_CONDUCT)).toBe(true);
  });

  it('keeps issuance separate from authoring', () => {
    // Issuing a report or certificate is irreversible, so it is a distinct grant
    // from being able to draft one.
    expect(PERMISSIONS.AUDIT_ISSUE).not.toBe(PERMISSIONS.AUDIT_CONDUCT);
    expect(PERMISSIONS.CERTIFICATE_ISSUE).not.toBe(PERMISSIONS.COURSE_AUTHOR);
  });
});

describe('isPermission', () => {
  it('accepts a catalogue permission', () => {
    expect(isPermission('delivery.project.read')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isPermission('projects.write')).toBe(false);
    expect(isPermission('')).toBe(false);
    expect(isPermission('admin')).toBe(false);
  });
});

describe('parsePermissions', () => {
  it('separates known from unknown', () => {
    const { permissions, unknown } = parsePermissions([
      'delivery.project.read',
      'legacy.permission.removed',
    ]);

    expect(permissions).toEqual(['delivery.project.read']);
    // Reported rather than dropped: an unrecognised permission usually means a
    // migration was missed, and silence there costs someone their access.
    expect(unknown).toEqual(['legacy.permission.removed']);
  });

  it('handles an empty list', () => {
    expect(parsePermissions([])).toEqual({ permissions: [], unknown: [] });
  });
});

describe('permissionsByDomain', () => {
  it('groups by the leading segment', () => {
    const grouped = permissionsByDomain();

    expect(grouped.get('consultancy')).toContain(PERMISSIONS.AUDIT_CONDUCT);
    expect(grouped.get('platform')).toContain(PERMISSIONS.AUDIT_LOG_READ);
  });

  it('accounts for every permission exactly once', () => {
    const total = [...permissionsByDomain().values()].reduce(
      (sum, permissions) => sum + permissions.length,
      0,
    );

    expect(total).toBe(ALL_PERMISSIONS.length);
  });
});
