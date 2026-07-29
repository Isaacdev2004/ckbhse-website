import type { AuthorizationContext } from '@workspace/platform/authorization';

/**
 * Extends the Express request with the per-request context.
 *
 * Both properties are declared non-optional because `requestContext` runs before
 * the router, so by the time any handler or downstream middleware sees a request
 * they are always populated. Typing them as optional would push a null check into
 * every call site to guard against a state that cannot occur.
 */
declare global {
  namespace Express {
    interface Request {
      /** Who is acting, with what permissions, in which tenant. */
      auth: AuthorizationContext;
      /** Correlates logs, audit entries and the client-visible error envelope. */
      requestId: string;
    }
  }
}
