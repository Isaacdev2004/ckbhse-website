import type { AuthorizationContext } from '@workspace/platform/authorization';

/** Minimal request shape auth middleware must understand. */
export interface AuthMiddlewareRequest {
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
  readonly cookies?: Readonly<Record<string, string | undefined>>;
  readonly ip?: string;
  readonly userAgent?: string;
}

/** Response helpers supplied by the host framework adapter. */
export interface AuthMiddlewareResponse {
  status(code: number): AuthMiddlewareResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string | readonly string[]): void;
}

/** Next callback continuing the middleware chain. */
export type AuthMiddlewareNext = () => void | Promise<void>;

/**
 * Framework-agnostic auth middleware contract.
 *
 * Implementations validate the session cookie (or bearer token for API clients),
 * attach an {@link AuthorizationContext} to the request, and fail closed when
 * credentials are missing or invalid.
 */
export interface AuthMiddleware {
  /** Requires an authenticated session; responds 401 when absent or expired. */
  requireAuth(
    request: AuthMiddlewareRequest,
    response: AuthMiddlewareResponse,
    next: AuthMiddlewareNext,
  ): void | Promise<void>;

  /** Populates context when a session exists; continues anonymously otherwise. */
  optionalAuth(
    request: AuthMiddlewareRequest,
    response: AuthMiddlewareResponse,
    next: AuthMiddlewareNext,
  ): void | Promise<void>;
}

/** Symbol key used by adapters to store the resolved context on a request. */
export const AUTH_CONTEXT_REQUEST_KEY = Symbol.for('ckbhse.auth.context');

/** Read an attached authorization context when present. */
export function getAuthContextFromRequest(
  request: AuthMiddlewareRequest & {
    readonly [AUTH_CONTEXT_REQUEST_KEY]?: AuthorizationContext;
  },
): AuthorizationContext | undefined {
  return request[AUTH_CONTEXT_REQUEST_KEY];
}
