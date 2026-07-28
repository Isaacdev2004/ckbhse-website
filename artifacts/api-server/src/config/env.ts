import { z } from 'zod/v4';

// Validated once at startup so misconfiguration fails immediately and loudly
// rather than at the first request that happens to need the value.

const csvToArray = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce.number().int().positive().max(65535).default(5000),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  // Comma-separated list of allowed browser origins. Empty means same-origin
  // only, which is correct for the dev proxy and for Replit's router.
  CORS_ORIGINS: z.string().default('').transform(csvToArray),

  // Behind Replit's router (and any future load balancer) Express must trust
  // the proxy, otherwise rate limiting keys every client to the proxy's IP.
  TRUST_PROXY: z
    .string()
    .default('false')
    .transform((value) => value !== 'false'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),

  // Rejected before the body is buffered, so a large payload cannot exhaust
  // memory ahead of any authorisation check.
  BODY_LIMIT: z.string().default('100kb'),

  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    'Invalid environment configuration:\n' + z.prettifyError(parsed.error),
  );
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
