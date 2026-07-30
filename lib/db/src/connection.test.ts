import { describe, expect, it } from 'vitest';
import {
  buildSupabaseConnectionStrings,
  createPoolConfig,
  extractSupabaseProjectRef,
  isSupabaseConnection,
  resolveConnectionString,
} from './connection.js';

describe('Supabase connection helpers', () => {
  it('extracts project ref from Supabase URL', () => {
    expect(
      extractSupabaseProjectRef('https://woszwytfhdtouesqccmf.supabase.co'),
    ).toBe('woszwytfhdtouesqccmf');
  });

  it('builds app and migrate connection strings', () => {
    const urls = buildSupabaseConnectionStrings({
      projectRef: 'woszwytfhdtouesqccmf',
      password: 'p@ss:word',
      poolerHost: 'aws-0-eu-west-2.pooler.supabase.com',
    });

    expect(urls.app).toContain('postgres.woszwytfhdtouesqccmf');
    expect(urls.app).toContain(':6543/postgres?pgbouncer=true');
    expect(urls.migrate).toContain('postgres.woszwytfhdtouesqccmf');
    expect(urls.migrate).toContain(':5432/postgres');
    expect(urls.migrate).toContain(encodeURIComponent('p@ss:word'));
  });

  it('detects Supabase hosts', () => {
    expect(
      isSupabaseConnection(
        'postgresql://postgres:pw@db.woszwytfhdtouesqccmf.supabase.co:5432/postgres',
      ),
    ).toBe(true);
    expect(isSupabaseConnection('postgresql://postgres:pw@localhost:5432/app')).toBe(
      false,
    );
  });

  it('enables SSL for Supabase pools', () => {
    const config = createPoolConfig(
      'postgresql://postgres:pw@db.woszwytfhdtouesqccmf.supabase.co:5432/postgres',
      { max: 2 },
    );
    expect(config.ssl).toEqual({ rejectUnauthorized: false });
    expect(config.max).toBe(2);
  });

  it('resolves migrate URL from Supabase env vars', () => {
    const previous = {
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_MIGRATE_URL: process.env.DATABASE_MIGRATE_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_DB_PASSWORD: process.env.SUPABASE_DB_PASSWORD,
      SUPABASE_POOLER_HOST: process.env.SUPABASE_POOLER_HOST,
    };

    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_MIGRATE_URL;
    process.env.SUPABASE_URL = 'https://woszwytfhdtouesqccmf.supabase.co';
    process.env.SUPABASE_DB_PASSWORD = 'secret';
    process.env.SUPABASE_POOLER_HOST = 'aws-0-eu-west-2.pooler.supabase.com';

    expect(resolveConnectionString('migrate')).toContain(
      'aws-0-eu-west-2.pooler.supabase.com:5432',
    );
    expect(resolveConnectionString('app')).toContain('pgbouncer=true');

    if (previous.DATABASE_URL !== undefined) {
      process.env.DATABASE_URL = previous.DATABASE_URL;
    } else {
      delete process.env.DATABASE_URL;
    }
    if (previous.DATABASE_MIGRATE_URL !== undefined) {
      process.env.DATABASE_MIGRATE_URL = previous.DATABASE_MIGRATE_URL;
    } else {
      delete process.env.DATABASE_MIGRATE_URL;
    }
    if (previous.SUPABASE_URL !== undefined) {
      process.env.SUPABASE_URL = previous.SUPABASE_URL;
    } else {
      delete process.env.SUPABASE_URL;
    }
    if (previous.SUPABASE_DB_PASSWORD !== undefined) {
      process.env.SUPABASE_DB_PASSWORD = previous.SUPABASE_DB_PASSWORD;
    } else {
      delete process.env.SUPABASE_DB_PASSWORD;
    }
    if (previous.SUPABASE_POOLER_HOST !== undefined) {
      process.env.SUPABASE_POOLER_HOST = previous.SUPABASE_POOLER_HOST;
    } else {
      delete process.env.SUPABASE_POOLER_HOST;
    }
  });
});
