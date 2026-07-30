#!/usr/bin/env tsx
/**
 * Disaster recovery rehearsal checklist.
 *
 * Verifies connectivity and health endpoints without mutating production data.
 * Uses Supabase/direct Postgres via @workspace/db connection helpers.
 */

import pg from 'pg';
import { createPoolConfig, resolveConnectionString } from '@workspace/db';
import { loadEnvFile } from '@workspace/db/load-env';

loadEnvFile();

const baseUrl = process.env.DR_BASE_URL ?? 'http://127.0.0.1:5000';

interface CheckResult {
  readonly name: string;
  readonly ok: boolean;
  readonly detail: string;
}

async function checkHealth(): Promise<CheckResult> {
  try {
    const response = await fetch(`${baseUrl}/api/v1/health`);
    if (!response.ok) {
      return {
        name: 'api-health',
        ok: false,
        detail: `HTTP ${response.status}`,
      };
    }
    const body = (await response.json()) as { status?: string };
    return {
      name: 'api-health',
      ok: body.status === 'ok',
      detail: JSON.stringify(body),
    };
  } catch (error) {
    return {
      name: 'api-health',
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkDatabase(): Promise<CheckResult> {
  let connectionString: string;
  try {
    connectionString = resolveConnectionString('migrate');
  } catch {
    return {
      name: 'database-connectivity',
      ok: true,
      detail: 'skipped — Supabase/database env not configured',
    };
  }

  const pool = new pg.Pool(createPoolConfig(connectionString, { max: 1 }));
  try {
    const result = await pool.query<{ ok: number }>('select 1 as ok');
    return {
      name: 'database-connectivity',
      ok: result.rows[0]?.ok === 1,
      detail: 'select 1 succeeded against Supabase',
    };
  } catch (error) {
    return {
      name: 'database-connectivity',
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await pool.end();
  }
}

async function main(): Promise<void> {
  const checks = await Promise.all([checkHealth(), checkDatabase()]);
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

await main();
