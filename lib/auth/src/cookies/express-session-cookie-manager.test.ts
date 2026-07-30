import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SESSION_COOKIE_NAME,
  ExpressSessionCookieManager,
  isSessionIdFormat,
} from './express-session-cookie-manager.js';

describe('isSessionIdFormat', () => {
  it('accepts UUID session ids', () => {
    expect(
      isSessionIdFormat('248d5d22-8553-4bb5-b13d-edf17d710a7a'),
    ).toBe(true);
  });

  it('rejects malformed session ids', () => {
    expect(isSessionIdFormat('invalid-session-id')).toBe(false);
    expect(isSessionIdFormat('')).toBe(false);
  });
});

describe('ExpressSessionCookieManager', () => {
  const manager = new ExpressSessionCookieManager({
    name: DEFAULT_SESSION_COOKIE_NAME,
    path: '/',
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAgeSeconds: 3600,
  });

  it('parses a valid session cookie', () => {
    expect(
      manager.parseCookieHeader(
        `${DEFAULT_SESSION_COOKIE_NAME}=248d5d22-8553-4bb5-b13d-edf17d710a7a`,
      ),
    ).toEqual({
      sessionId: '248d5d22-8553-4bb5-b13d-edf17d710a7a',
    });
  });

  it('ignores malformed session cookies', () => {
    expect(
      manager.parseCookieHeader(
        `${DEFAULT_SESSION_COOKIE_NAME}=invalid-session-id`,
      ),
    ).toBeNull();
  });
});
