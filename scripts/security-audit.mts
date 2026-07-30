#!/usr/bin/env tsx
/**
 * Local security audit gate — dependency vulnerabilities and required env keys.
 */

import { execSync } from 'node:child_process';

const REQUIRED_PRODUCTION_KEYS = [
  'PLATFORM_ORGANIZATION_ID',
  'COOKIE_SECRET',
] as const;

function hasDatabaseConfig(): boolean {
  if (process.env.DATABASE_URL?.trim()) {
    return true;
  }
  return Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_DB_PASSWORD?.trim(),
  );
}

interface CheckResult {
  readonly name: string;
  readonly ok: boolean;
  readonly detail: string;
}

function runDependencyAudit(): CheckResult {
  try {
    execSync('pnpm audit --audit-level=high', {
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return {
      name: 'dependency-audit',
      ok: true,
      detail: 'no high or critical vulnerabilities reported',
    };
  } catch (error) {
    const message =
      error instanceof Error && 'stdout' in error
        ? String((error as NodeJS.ErrnoException & { stdout?: string }).stdout ?? error.message)
        : String(error);
    return {
      name: 'dependency-audit',
      ok: false,
      detail: message.trim().slice(0, 500),
    };
  }
}

function checkRequiredEnv(): CheckResult {
  if (process.env.SECURITY_AUDIT_SKIP_ENV === '1') {
    return {
      name: 'required-env-keys',
      ok: true,
      detail: 'skipped — SECURITY_AUDIT_SKIP_ENV=1',
    };
  }

  const missing = REQUIRED_PRODUCTION_KEYS.filter(
    (key) => process.env[key] === undefined || process.env[key]?.trim() === '',
  );
  const databaseConfigured = hasDatabaseConfig();

  return {
    name: 'required-env-keys',
    ok: missing.length === 0 && databaseConfigured,
    detail:
      missing.length === 0 && databaseConfigured
        ? 'all required keys present'
        : [
            missing.length > 0 ? `missing: ${missing.join(', ')}` : null,
            !databaseConfigured
              ? 'missing database: set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD'
              : null,
          ]
            .filter(Boolean)
            .join('; '),
  };
}

function main(): void {
  const checks = [runDependencyAudit(), checkRequiredEnv()];
  let failed = false;

  for (const check of checks) {
    const label = check.ok ? 'PASS' : 'FAIL';
    console.log(`[${label}] ${check.name}: ${check.detail}`);
    if (!check.ok) {
      failed = true;
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}

main();
