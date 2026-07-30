import type { SessionId } from '@workspace/domain/shared';

/** Attributes applied when issuing the session cookie. */
export interface SessionCookieOptions {
  readonly name: string;
  readonly domain?: string;
  readonly path: string;
  readonly secure: boolean;
  readonly httpOnly: boolean;
  readonly sameSite: 'strict' | 'lax' | 'none';
  readonly maxAgeSeconds: number;
}

/** Parsed session cookie payload. */
export interface SessionCookieValue {
  readonly sessionId: SessionId;
}

/**
 * Reads and writes the HttpOnly session transport cookie.
 *
 * The cookie value must contain only an opaque session identifier — never JWT
 * claims or permission data.
 */
export interface SessionCookieManager {
  readonly options: SessionCookieOptions;

  /** Serialise a Set-Cookie header value for a new or renewed session. */
  buildSetCookieHeader(sessionId: SessionId): string;

  /** Serialise a Set-Cookie header that clears the session cookie. */
  buildClearCookieHeader(): string;

  /** Extract the session id from incoming Cookie headers, if present. */
  parseCookieHeader(cookieHeader: string | undefined): SessionCookieValue | null;
}
