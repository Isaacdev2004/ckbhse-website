import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPoolConfig, resolveConnectionString } from './connection.js';
import { loadEnvFile } from './load-env.js';

const { Pool } = pg;

loadEnvFile();

let connectionString: string;
try {
  connectionString = resolveConnectionString('migrate');
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'DATABASE connection is not configured.',
  );
  process.exit(1);
}

const pool = new Pool(createPoolConfig(connectionString, { max: 1 }));
const db = drizzle(pool);

const migrationsFolder = join(
  fileURLToPath(new URL('.', import.meta.url)),
  '..',
  'migrations',
);

try {
  await migrate(db, { migrationsFolder });
  console.log('Migrations applied successfully.');
} catch (error) {
  console.error('Migration failed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
