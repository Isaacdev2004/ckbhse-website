import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { env, isProduction, isTest } from '../config/env';
import { ApiError } from '../lib/errors';

export const securityHeaders: RequestHandler = helmet({
  // The API serves JSON only, so the restrictive default CSP is appropriate;
  // the frontends are served separately and set their own policy.
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'no-referrer' },
  // Only meaningful over HTTPS; enabling it locally would pin localhost to
  // HTTPS in the developer's browser for months.
  hsts: isProduction,
});

const allowlist = new Set(env.CORS_ORIGINS);

export const corsPolicy: RequestHandler = cors({
  origin(origin, callback) {
    // Same-origin and non-browser callers (curl, server-to-server, health
    // probes) send no Origin header and are not subject to CORS.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowlist.has(origin)) {
      callback(null, true);
      return;
    }

    callback(ApiError.forbidden(`Origin not allowed: ${origin}`));
  },
  // Required for session cookies once authentication lands.
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86_400,
} satisfies CorsOptions);

export const rateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  // Tests would otherwise share counters across cases.
  skip: () => isTest,
  handler: (_req, _res, next) => {
    next(new ApiError('rate_limited', 'Too many requests, please retry later'));
  },
});

/**
 * Far stricter budget for credential endpoints (login, password reset, MFA).
 * Mount per-route as those routes are added.
 */
export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => isTest,
  handler: (_req, _res, next) => {
    next(new ApiError('rate_limited', 'Too many attempts, please retry later'));
  },
});
