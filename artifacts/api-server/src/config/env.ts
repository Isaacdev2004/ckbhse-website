import { z } from 'zod/v4';

/**
 * Environment validation.
 *
 * Parsed once at import time so misconfiguration fails at startup, loudly, rather
 * than at the first request that happens to need the value. In a rolling deploy
 * that difference matters: a process that refuses to boot is caught by the health
 * check and rolled back, whereas one that boots and then 500s on a subset of
 * routes is discovered by users.
 *
 * This module owns *parsing* only. Derived and grouped configuration lives in
 * `./index.ts`, so there is one place to read config from and one place it is
 * defined.
 */

const csvToArray = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const booleanFromString = (defaultValue: 'true' | 'false') =>
  z
    .string()
    .default(defaultValue)
    .transform((value) => value !== 'false');

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    /**
     * Deployment tier, which is not the same thing as `NODE_ENV`: staging runs a
     * production build against non-production data, so feature flags and log
     * verbosity need to distinguish them.
     */
    APP_ENV: z
      .enum(['development', 'test', 'staging', 'production'])
      .optional(),

    PORT: z.coerce.number().int().positive().max(65535).default(5000),

    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),

    // Comma-separated list of allowed browser origins. Empty means same-origin
    // only, which is correct for the dev proxy and for Replit's router.
    CORS_ORIGINS: z.string().default('').transform(csvToArray),

    // Behind Replit's router (and any future load balancer) Express must trust
    // the proxy, otherwise rate limiting keys every client to the proxy's IP.
    TRUST_PROXY: booleanFromString('false'),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),

    // Rejected before the body is buffered, so a large payload cannot exhaust
    // memory ahead of any authorisation check.
    BODY_LIMIT: z.string().default('100kb'),

    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),

    /**
     * Signs session and CSRF cookies. Optional until authentication lands, but
     * once set it must be at least 32 bytes of entropy — a short secret is
     * brute-forceable offline, and a cookie signature is only as good as its key.
     */
    COOKIE_SECRET: z.string().min(32).optional(),

    /**
     * Cookie domain. Left unset for the single-origin deployment in Document 04
     * section 2.4, which scopes cookies to the exact host.
     */
    COOKIE_DOMAIN: z.string().optional(),

    /**
     * Postgres connection string. Optional in this phase because no route reads
     * the database yet; `lib/db` fails on its own if a query is attempted
     * without it.
     */
    DATABASE_URL: z.string().url().optional(),
  })
  .superRefine((value, ctx) => {
    // Production has stricter requirements than the shape alone can express.
    const appEnv = value.APP_ENV ?? value.NODE_ENV;
    if (appEnv !== 'production') return;

    if (value.COOKIE_SECRET === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['COOKIE_SECRET'],
        message: 'COOKIE_SECRET is required in production',
      });
    }

    if (!value.TRUST_PROXY) {
      // Without this, express-rate-limit keys every client to the load
      // balancer's address, so one noisy client rate-limits everyone.
      ctx.addIssue({
        code: 'custom',
        path: ['TRUST_PROXY'],
        message:
          'TRUST_PROXY must be enabled in production, which runs behind a proxy',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    'Invalid environment configuration:\n' +
      z.prettifyError(parsed.error) +
      '\n\nSee .env.example for the expected variables.',
  );
  process.exit(1);
}

export type Env = z.infer<typeof envSchema>;

export const env: Env = parsed.data;
