import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { AppError } from '@workspace/platform/errors';
import { recordSecurityEvent } from '@workspace/platform/logging';
import { csrfConfig } from '../config';
import { securityLogger } from '../lib/logger';

/**
 * CSRF protection using the double-submit cookie pattern.
 *
 * The platform authenticates with cookies, which means the browser attaches
 * credentials to cross-site requests automatically; `SameSite=Lax` blocks the
 * common cases but is not a complete defence (it permits top-level GET
 * navigations, and its enforcement varies across browser versions). The
 * double-submit check closes the gap: an attacker's page can cause a request to
 * be *sent* with cookies, but cannot read our cookie to put its value in a
 * header, because that is exactly what the same-origin policy prevents.
 *
 * Enforcement is active from this phase so that authentication cannot land
 * without it. It is a no-op for the current API surface only because that surface
 * is entirely safe methods — the moment a state-changing route is added, it is
 * protected by default rather than by remembering.
 */

/** Methods that must not change state, and so need no token. */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const CSRF_TOKEN_BYTES = 32;

export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_BYTES).toString('base64url');
}

/**
 * Compare in constant time.
 *
 * A plain `===` on a secret leaks its prefix through timing. The length check is
 * unavoidable and safe to do early, since length is not the secret.
 */
function tokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Issues the CSRF cookie when one is missing.
 *
 * Mounted globally so any page load primes the token, meaning a client's first
 * state-changing request already has one to echo.
 */
export const issueCsrfToken: RequestHandler = (req, res, next) => {
  if (req.cookies?.[csrfConfig.cookieName] === undefined) {
    res.cookie(
      csrfConfig.cookieName,
      generateCsrfToken(),
      csrfConfig.cookieOptions,
    );
  }

  next();
};

/**
 * Rejects an unsafe request whose header token does not match its cookie token.
 *
 * Requests carrying no session cookie are exempt: CSRF is an attack on ambient
 * credentials, so a request with none to abuse has nothing to forge. That
 * exemption is what lets this be mounted globally today without breaking
 * unauthenticated endpoints such as the contact form.
 */
export const verifyCsrfToken: RequestHandler = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[csrfConfig.cookieName];
  const headerToken = req.headers[csrfConfig.headerName];

  // No cookie at all means no ambient credential to abuse.
  if (typeof cookieToken !== 'string') {
    next();
    return;
  }

  if (
    typeof headerToken !== 'string' ||
    !tokensMatch(cookieToken, headerToken)
  ) {
    recordSecurityEvent(
      securityLogger,
      {
        event: 'csrf.rejected',
        outcome: 'denied',
        requestId: req.requestId,
        ...(req.ip !== undefined ? { ipAddress: req.ip } : {}),
        method: req.method,
        path: req.path,
      },
      'CSRF token missing or mismatched',
    );

    next(AppError.forbidden('CSRF token missing or invalid'));
    return;
  }

  next();
};
