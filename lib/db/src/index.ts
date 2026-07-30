import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { createPoolConfig, resolveConnectionString } from './connection.js';
import * as schema from './schema/index.js';

const { Pool } = pg;

export type Database = NodePgDatabase<typeof schema>;
export type DatabaseSchema = typeof schema;

let pool: pg.Pool | null = null;
let database: Database | null = null;

/** Lazily initialised connection pool — safe to import without DATABASE_URL in tests. */
export function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool(createPoolConfig(resolveConnectionString('app')));
  }
  return pool;
}

/** Lazily initialised Drizzle client bound to the full schema. */
export function getDb(): Database {
  if (!database) {
    database = drizzle(getPool(), { schema });
  }
  return database;
}

/** Close the pool — for graceful shutdown and test teardown. */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    database = null;
  }
}

/** @deprecated Use getDb() — retained for migration runner compatibility. */
export function createDb(connectionString: string): Database {
  const migrationPool = new Pool(createPoolConfig(connectionString, { max: 1 }));
  return drizzle(migrationPool, { schema });
}

export {
  buildSupabaseConnectionStrings,
  createPoolConfig,
  extractSupabaseProjectRef,
  isSupabaseConnection,
  resolveConnectionString,
} from './connection.js';

export * from './schema/index.js';
