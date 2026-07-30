import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL ?? 'postgresql://database-url-not-set';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
