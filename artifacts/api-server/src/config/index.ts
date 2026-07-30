import type { CookieOptions } from 'express';
import type { Environment } from '@workspace/platform/flags';
import { env } from './env';

/**
 * The single place application code reads configuration from.
 *
 * `env.ts` parses and validates raw strings; this module groups them into the
 * shapes callers actually want and derives everything else. The reason for the
 * split is that derived values — "is this production", "what cookie flags" — were
 * previously recomputed at each call site, and a policy expressed in five places
 * is a policy that will eventually disagree with itself.
 *
 * Nothing outside this directory should read `process.env`.
 */

/**
 * Deployment tier. Falls back to `NODE_ENV` when `APP_ENV` is unset, so existing
 * deployments keep working, but staging can be distinguished once it exists.
 */
export const appEnv: Environment = env.APP_ENV ?? env.NODE_ENV;

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const isDevelopment = env.NODE_ENV === 'development';

export const serverConfig = {
  port: env.PORT,
  bodyLimit: env.BODY_LIMIT,
  shutdownTimeoutMs: env.SHUTDOWN_TIMEOUT_MS,
  trustProxy: env.TRUST_PROXY,
} as const;

export const logConfig = {
  level: env.LOG_LEVEL,
  /** Pretty printing is a development affordance; production needs parseable JSON. */
  pretty: !isProduction,
} as const;

export const corsConfig = {
  allowedOrigins: env.CORS_ORIGINS,
} as const;

export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  /** Credential endpoints get a far smaller budget over a longer window. */
  authWindowMs: 15 * 60_000,
  authMax: 10,
} as const;

/**
 * Cookie defaults for session and CSRF cookies.
 *
 * Each flag is load-bearing:
 *  - `httpOnly` keeps the session token unreadable from JavaScript, so a single
 *    cross-site scripting bug cannot become account takeover.
 *  - `secure` in production only, because localhost is served over HTTP and a
 *    secure cookie would silently never be set there.
 *  - `sameSite: 'lax'` is the strongest setting compatible with following a link
 *    from an email into an authenticated page, and combined with the single-origin
 *    deployment it already blocks cross-site form posts.
 *  - `path: '/'` so one session serves every application prefix.
 */
export const cookieConfig = {
  secret: env.COOKIE_SECRET,
  options: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    ...(env.COOKIE_DOMAIN !== undefined ? { domain: env.COOKIE_DOMAIN } : {}),
  } satisfies CookieOptions,
} as const;

/**
 * The CSRF token cookie is deliberately *not* `httpOnly`: the double-submit
 * pattern requires the browser to read it and echo it back in a header.
 */
export const csrfConfig = {
  cookieName: 'csrf_token',
  headerName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    ...(env.COOKIE_DOMAIN !== undefined ? { domain: env.COOKIE_DOMAIN } : {}),
  } satisfies CookieOptions,
} as const;

export const databaseConfig = {
  url: env.DATABASE_URL,
  configured:
    env.DATABASE_URL !== undefined ||
    (env.SUPABASE_URL !== undefined &&
      env.SUPABASE_DB_PASSWORD !== undefined &&
      env.SUPABASE_DB_PASSWORD.length > 0),
} as const;

export const platformConfig = {
  organizationId: env.PLATFORM_ORGANIZATION_ID,
  configured: env.PLATFORM_ORGANIZATION_ID !== undefined,
} as const;

export const appVersion = env.APP_VERSION;

export const buildConfig = {
  sha: env.BUILD_SHA ?? null,
  time: env.BUILD_TIME ?? null,
} as const;

export const emailConfig = {
  supportEmail: env.CRM_SUPPORT_EMAIL ?? 'enquiries@ckbhse.co.uk',
  fromEmail: env.EMAIL_FROM ?? 'noreply@ckbhse.co.uk',
  fromName: env.EMAIL_FROM_NAME,
  smtpHost: env.SMTP_HOST,
  smtpPort: env.SMTP_PORT,
  smtpSecure: env.SMTP_SECURE,
  smtpUser: env.SMTP_USER,
  smtpPass: env.SMTP_PASS,
  smtpConfigured: env.SMTP_HOST !== undefined,
} as const;

/**
 * A redacted snapshot for diagnostics and startup logging.
 *
 * Returns presence rather than values for anything sensitive, so it is safe to
 * log and safe to expose behind a permission — which is what makes it useful
 * during an incident instead of something nobody dares print.
 */
export function configSummary(): Record<string, unknown> {
  return {
    nodeEnv: env.NODE_ENV,
    appEnv,
    port: serverConfig.port,
    logLevel: logConfig.level,
    trustProxy: serverConfig.trustProxy,
    corsOrigins: corsConfig.allowedOrigins.length,
    bodyLimit: serverConfig.bodyLimit,
    rateLimit: `${rateLimitConfig.max}/${rateLimitConfig.windowMs}ms`,
    cookieSecretConfigured: cookieConfig.secret !== undefined,
    databaseConfigured: databaseConfig.configured,
    platformOrganizationConfigured: platformConfig.configured,
    appVersion,
  };
}
