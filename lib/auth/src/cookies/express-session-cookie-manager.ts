import type { SessionId } from '@workspace/domain/shared';
import type {
  SessionCookieManager,
  SessionCookieOptions,
  SessionCookieValue,
} from './session-cookie.interface.js';

export const DEFAULT_SESSION_COOKIE_NAME = 'ckbhse_session';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isSessionIdFormat(value: string): value is SessionId {
  return UUID_RE.test(value);
}

function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (cookieHeader === undefined) {
    return map;
  }

  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey === undefined || rest.length === 0) {
      continue;
    }
    map.set(rawKey, decodeURIComponent(rest.join('=')));
  }

  return map;
}

export class ExpressSessionCookieManager implements SessionCookieManager {
  readonly options: SessionCookieOptions;

  constructor(options: SessionCookieOptions) {
    this.options = options;
  }

  buildSetCookieHeader(sessionId: SessionId): string {
    const parts = [
      `${this.options.name}=${encodeURIComponent(sessionId)}`,
      `Path=${this.options.path}`,
      `Max-Age=${this.options.maxAgeSeconds}`,
      `SameSite=${capitalizeSameSite(this.options.sameSite)}`,
    ];

    if (this.options.httpOnly) {
      parts.push('HttpOnly');
    }
    if (this.options.secure) {
      parts.push('Secure');
    }
    if (this.options.domain !== undefined) {
      parts.push(`Domain=${this.options.domain}`);
    }

    return parts.join('; ');
  }

  buildClearCookieHeader(): string {
    const parts = [
      `${this.options.name}=`,
      `Path=${this.options.path}`,
      'Max-Age=0',
      `SameSite=${capitalizeSameSite(this.options.sameSite)}`,
    ];

    if (this.options.httpOnly) {
      parts.push('HttpOnly');
    }
    if (this.options.secure) {
      parts.push('Secure');
    }
    if (this.options.domain !== undefined) {
      parts.push(`Domain=${this.options.domain}`);
    }

    return parts.join('; ');
  }

  parseCookieHeader(
    cookieHeader: string | undefined,
  ): SessionCookieValue | null {
    const cookies = parseCookies(cookieHeader);
    const value = cookies.get(this.options.name);
    if (value === undefined || value.length === 0) {
      return null;
    }

    if (!isSessionIdFormat(value)) {
      return null;
    }

    return { sessionId: value };
  }
}

function capitalizeSameSite(value: SessionCookieOptions['sameSite']): string {
  if (value === 'lax') return 'Lax';
  if (value === 'strict') return 'Strict';
  return 'None';
}
