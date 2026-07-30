import { asSessionId, isAuthenticated } from '@workspace/platform/authorization';
import type { RequestHandler } from 'express';
import { container } from '../container';

/**
 * Resolves authenticated sessions from the HttpOnly session cookie.
 *
 * Runs after anonymous context creation and before route handlers. When a valid
 * session exists, {@link req.auth} is replaced with the resolved user context.
 */
export const sessionAuth: RequestHandler = async (req, _res, next) => {
  try {
    if (container.auth === null || container.sessionCookies === null) {
      next();
      return;
    }

    if (isAuthenticated(req.auth)) {
      next();
      return;
    }

    const parsed = container.sessionCookies.parseCookieHeader(req.headers.cookie);
    if (parsed === null) {
      next();
      return;
    }

    const context = await container.auth.getSession(
      asSessionId(parsed.sessionId),
      req.auth.metadata,
    );

    if (context !== null) {
      req.auth = context;
    }

    next();
  } catch (error) {
    next(error);
  }
};
