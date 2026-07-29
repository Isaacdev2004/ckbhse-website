import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { AppError } from '@workspace/platform/errors';
import { recordSecurityEvent } from '@workspace/platform/logging';
import { corsConfig, isProduction, isTest, rateLimitConfig } from '../config';
import { securityLogger } from '../lib/logger';

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

const allowlist = new Set(corsConfig.allowedOrigins);

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

    // Logged on the security channel: a spike of rejected origins is either a
    // misconfigured deployment or someone probing, and both are worth seeing.
    recordSecurityEvent(
      securityLogger,
      { event: 'cors.rejected', outcome: 'denied', origin },
      'Rejected a disallowed origin',
    );

    callback(AppError.forbidden(`Origin not allowed: ${origin}`));
  },
  // Required for session cookies once authentication lands.
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86_400,
} satisfies CorsOptions);

function onRateLimited(scope: 'global' | 'credential'): RequestHandler {
  return (req, _res, next) => {
    recordSecurityEvent(
      securityLogger,
      {
        event: 'rate_limit.exceeded',
        outcome: 'denied',
        scope,
        requestId: req.requestId,
        ...(req.ip !== undefined ? { ipAddress: req.ip } : {}),
        path: req.path,
      },
      'Rate limit exceeded',
    );

    next(
      AppError.rateLimited(
        scope === 'credential'
          ? 'Too many attempts, please retry later'
          : 'Too many requests, please retry later',
      ),
    );
  };
}

export const rateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  limit: rateLimitConfig.max,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  // Tests would otherwise share counters across cases.
  skip: () => isTest,
  handler: onRateLimited('global'),
});

/**
 * Far stricter budget for credential endpoints (login, password reset, MFA).
 * Mount per-route as those routes are added.
 *
 * `skipSuccessfulRequests` means the budget is spent only on failures, so a
 * legitimate user is never locked out by working normally, while credential
 * stuffing exhausts it within a handful of attempts.
 */
export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: rateLimitConfig.authWindowMs,
  limit: rateLimitConfig.authMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => isTest,
  handler: onRateLimited('credential'),
});
