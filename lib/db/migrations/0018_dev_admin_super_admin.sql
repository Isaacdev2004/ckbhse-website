-- Dev admin must use super_admin for full admin portal evaluation.
-- platform_admin is intentionally scoped without platform.tenant.view.
UPDATE user_roles
SET role_id = (SELECT id FROM roles WHERE key = 'super_admin' LIMIT 1)
WHERE user_id = '00000000-0000-4000-8000-000000000011'
  AND role_id = (SELECT id FROM roles WHERE key = 'platform_admin' LIMIT 1);
