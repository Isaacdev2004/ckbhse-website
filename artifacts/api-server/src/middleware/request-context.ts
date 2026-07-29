import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import {
  createAnonymousContext,
  type RequestMetadata,
} from '@workspace/platform/authorization';

/**
 * Establishes the per-request context: a correlation id, client metadata, and the
 * authorization context that every downstream layer reads from.
 *
 * Until authentication lands, every request is anonymous. That is the correct
 * default and the important one: the context is built here, once, from the
 * session, so a route cannot construct a more privileged one for itself. When
 * session parsing arrives it replaces the body of `resolveContext` and nothing
 * downstream changes.
 */

/** Header used to propagate a correlation id between services. */
const REQUEST_ID_HEADER = 'x-request-id';

/**
 * A client-supplied id is echoed but never trusted for anything security
 * relevant: it appears in logs and in the error envelope, so accepting an
 * arbitrary one is only a log-forging risk, which the length cap contains.
 */
function resolveRequestId(headerValue: unknown): string {
  if (typeof headerValue === 'string') {
    const trimmed = headerValue.trim();
    if (
      trimmed.length > 0 &&
      trimmed.length <= 128 &&
      /^[\w.-]+$/.test(trimmed)
    ) {
      return trimmed;
    }
  }

  return randomUUID();
}

export const requestContext: RequestHandler = (req, res, next) => {
  const requestId = resolveRequestId(req.headers[REQUEST_ID_HEADER]);

  const metadata: RequestMetadata = {
    requestId,
    // `req.ip` respects the trust-proxy setting, so this is the real client
    // address in production and the socket address locally.
    ...(req.ip !== undefined ? { ipAddress: req.ip } : {}),
    ...(typeof req.headers['user-agent'] === 'string'
      ? { userAgent: req.headers['user-agent'] }
      : {}),
  };

  req.requestId = requestId;
  req.auth = createAnonymousContext(metadata);

  // Echoed so a client can quote it in a support request, and so a proxy can
  // stitch its own logs to ours.
  res.setHeader(REQUEST_ID_HEADER, requestId);

  next();
};
