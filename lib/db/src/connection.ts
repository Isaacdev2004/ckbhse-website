import type pg from 'pg';

export type ConnectionPurpose = 'app' | 'migrate';

/** Project ref from `https://<ref>.supabase.co`. */
export function extractSupabaseProjectRef(supabaseUrl: string): string {
  try {
    const hostname = new URL(supabaseUrl).hostname;
    if (!hostname.endsWith('.supabase.co')) {
      return '';
    }
    return hostname.replace('.supabase.co', '');
  } catch {
    return '';
  }
}

export function isSupabaseConnection(connectionString: string): boolean {
  return (
    connectionString.includes('supabase.co') ||
    connectionString.includes('pooler.supabase.com')
  );
}

export function buildSupabaseConnectionStrings(input: {
  readonly projectRef: string;
  readonly password: string;
  readonly poolerHost?: string;
}): { readonly app: string; readonly migrate: string } {
  const encoded = encodeURIComponent(input.password);
  const ref = input.projectRef;
  const poolerHost =
    input.poolerHost ??
    process.env.SUPABASE_POOLER_HOST ??
    'aws-0-eu-west-2.pooler.supabase.com';

  return {
    app: `postgresql://postgres.${ref}:${encoded}@${poolerHost}:6543/postgres?pgbouncer=true`,
    // Session pooler (5432) — works when direct db.* host is IPv6-only.
    migrate: `postgresql://postgres.${ref}:${encoded}@${poolerHost}:5432/postgres`,
  };
}

export function resolveConnectionString(purpose: ConnectionPurpose): string {
  if (purpose === 'migrate' && process.env.DATABASE_MIGRATE_URL) {
    return process.env.DATABASE_MIGRATE_URL;
  }

  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (supabaseUrl && password) {
    const projectRef = extractSupabaseProjectRef(supabaseUrl);
    if (projectRef === '') {
      throw new Error('SUPABASE_URL must be https://<project-ref>.supabase.co');
    }

    const urls = buildSupabaseConnectionStrings({
      projectRef,
      password,
      ...(process.env.SUPABASE_POOLER_HOST
        ? { poolerHost: process.env.SUPABASE_POOLER_HOST }
        : {}),
    });
    return purpose === 'migrate' ? urls.migrate : urls.app;
  }

  throw new Error(
    purpose === 'migrate'
      ? 'Set DATABASE_MIGRATE_URL, DATABASE_URL, or SUPABASE_URL + SUPABASE_DB_PASSWORD'
      : 'Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD',
  );
}

export function createPoolConfig(
  connectionString: string,
  options: { max?: number } = {},
): pg.PoolConfig {
  const config: pg.PoolConfig = {
    connectionString,
    max: options.max ?? Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
  };

  if (isSupabaseConnection(connectionString)) {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}
