#!/usr/bin/env node
/**
 * Generates the RBAC seed section for migration 0002_auth.sql.
 * Run: node scripts/generate-auth-seed-sql.mjs > lib/db/migrations/0002_auth_seed.generated.sql
 */
import { createHash } from 'node:crypto';
import {
  PERMISSION_SEED,
  ROLE_SEED,
  ROLE_PERMISSION_SEED,
} from '../lib/data/src/seed/permissions-seed.ts';

function escapeSql(value) {
  return value.replace(/'/g, "''");
}

function stableUuid(namespace) {
  const hex = createHash('sha256').update(namespace).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export const PLATFORM_ORG_ID = '00000000-0000-4000-8000-000000000001';
export const DEV_CONSULTANT_USER_ID = '00000000-0000-4000-8000-000000000010';
export const DEV_ADMIN_USER_ID = '00000000-0000-4000-8000-000000000011';

/** Precomputed Argon2id hash for development password `StaffDev123!` */
export const DEV_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$/N18LYPQyHhe9GJd3/V4Kg$fmekorp4Kg0OnjDgsknvBJFjgSwAZYl69Catdiz/rYQ';

const permissionIds = Object.fromEntries(
  PERMISSION_SEED.map((row) => [row.key, stableUuid(`perm:${row.key}`)]),
);
const roleIds = Object.fromEntries(
  ROLE_SEED.map((row) => [row.key, stableUuid(`role:${row.key}`)]),
);

const lines = [];

lines.push('-- Generated RBAC seed (do not edit by hand)');
lines.push('');

lines.push(
  `INSERT INTO organizations (id, name, slug, status, type) VALUES ('${PLATFORM_ORG_ID}', 'CKBHSE Platform', 'ckbhse-platform', 'active', 'platform_operator') ON CONFLICT (id) DO NOTHING;`,
);
lines.push('');

lines.push(
  'INSERT INTO permissions (id, key, name, description, domain) VALUES',
);
lines.push(
  PERMISSION_SEED.map(
    (row) =>
      `  ('${permissionIds[row.key]}', '${escapeSql(row.key)}', '${escapeSql(row.name)}', NULL, '${escapeSql(row.domain)}')`,
  ).join(',\n') + ' ON CONFLICT DO NOTHING;',
);
lines.push('');

lines.push('INSERT INTO roles (id, key, name, description, is_system) VALUES');
lines.push(
  ROLE_SEED.map(
    (row) =>
      `  ('${roleIds[row.key]}', '${escapeSql(row.key)}', '${escapeSql(row.name)}', ${row.description ? `'${escapeSql(row.description)}'` : 'NULL'}, ${row.isSystem})`,
  ).join(',\n') + ' ON CONFLICT DO NOTHING;',
);
lines.push('');

lines.push('INSERT INTO role_permissions (id, role_id, permission_id) VALUES');
lines.push(
  ROLE_PERMISSION_SEED.map((row, index) => {
    const id = stableUuid(`rp:${row.roleKey}:${row.permissionKey}:${index}`);
    return `  ('${id}', '${roleIds[row.roleKey]}', '${permissionIds[row.permissionKey]}')`;
  }).join(',\n') + ' ON CONFLICT DO NOTHING;',
);
lines.push('');

lines.push(`INSERT INTO users (id, email, first_name, last_name, status, password_hash, email_verified_at)
VALUES
  ('${DEV_CONSULTANT_USER_ID}', 'consultant@ckbhse.co.uk', 'Dev', 'Consultant', 'active', '${DEV_PASSWORD_HASH}', now()),
  ('${DEV_ADMIN_USER_ID}', 'admin@ckbhse.co.uk', 'Dev', 'Admin', 'active', '${DEV_PASSWORD_HASH}', now())
ON CONFLICT (id) DO NOTHING;`);
lines.push('');

lines.push(`INSERT INTO user_roles (id, user_id, role_id, organization_id, scope_type, approved_at)
VALUES
  ('${stableUuid('ur:consultant')}', '${DEV_CONSULTANT_USER_ID}', '${roleIds.consultant}', '${PLATFORM_ORG_ID}', 'organization', now()),
  ('${stableUuid('ur:admin')}', '${DEV_ADMIN_USER_ID}', '${roleIds.super_admin}', '${PLATFORM_ORG_ID}', 'organization', now())
ON CONFLICT DO NOTHING;`);

console.log(lines.join('\n'));
