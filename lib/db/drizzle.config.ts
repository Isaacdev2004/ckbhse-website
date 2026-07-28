import { defineConfig } from 'drizzle-kit';
import path from 'path';

// `generate` and `check` work purely from the schema files, so a database is
// deliberately not required here — CI must be able to verify that migrations
// are in sync without provisioning Postgres. `migrate` and `push` will fail on
// connect if DATABASE_URL is unset, which is the correct outcome.
const url = process.env.DATABASE_URL ?? 'postgresql://database-url-not-set';

export default defineConfig({
  schema: path.join(__dirname, './src/schema/index.ts'),
  out: path.join(__dirname, './migrations'),
  dialect: 'postgresql',
  dbCredentials: { url },
  // Warn before running statements that would destroy data.
  strict: true,
  verbose: true,
});
