import { describe, expect, it, vi } from 'vitest';
import {
  asOrganizationId,
  asUserId,
} from '@workspace/domain/shared';
import {
  asSessionId,
  createAnonymousContext,
  createUserContext,
} from '@workspace/platform/authorization';
import { AppError } from '@workspace/platform/errors';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { SessionStore } from '@workspace/auth';
import { Argon2PasswordHasher } from '@workspace/auth';
import {
  AuthService,
  generateOpaqueToken,
  hashOpaqueToken,
} from './auth.service.js';

describe('AuthService token helpers', () => {
  it('hashes opaque tokens deterministically', () => {
    const token = generateOpaqueToken();
    expect(hashOpaqueToken(token)).toBe(hashOpaqueToken(token));
    expect(hashOpaqueToken(token)).not.toBe(token);
  });
});

describe('AuthService.getCurrentUser', () => {
  it('returns the active user profile from the authorization context', async () => {
    const service = new AuthService({
      db: {
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(async () => [
                {
                  id: 'user-1',
                  email: 'consultant@ckbhse.co.uk',
                  firstName: 'Casey',
                  lastName: 'Consultant',
                  status: 'active',
                  passwordHash: 'hash',
                },
              ]),
            })),
          })),
        })),
      } as never,
      sessionStore: {} as SessionStore,
      sessionCookies: {} as never,
      passwordHasher: new Argon2PasswordHasher(),
      passwordPolicy: {} as never,
      permissionResolver: {} as never,
      roleResolver: {} as never,
      defaultOrganizationId: 'org-1',
    });

    const profile = await service.getCurrentUser(
      createUserContext({
        userId: asUserId('user-1'),
        organizationId: asOrganizationId('org-1'),
        sessionId: asSessionId('session-1'),
        roles: ['consultant'],
        permissions: [PERMISSIONS.LEAD_READ],
        metadata: { requestId: 'req-1' },
      }),
    );

    expect(profile.user.email).toBe('consultant@ckbhse.co.uk');
    expect(profile.organizationId).toBe('org-1');
    expect(profile.roles).toEqual(['consultant']);
    expect(profile.permissions).toEqual([PERMISSIONS.LEAD_READ]);
  });

  it('rejects anonymous callers', async () => {
    const service = new AuthService({
      db: {} as never,
      sessionStore: {} as SessionStore,
      sessionCookies: {} as never,
      passwordHasher: new Argon2PasswordHasher(),
      passwordPolicy: {} as never,
      permissionResolver: {} as never,
      roleResolver: {} as never,
      defaultOrganizationId: 'org-1',
    });

    await expect(
      service.getCurrentUser(createAnonymousContext({ requestId: 'req-1' })),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('rejects inactive users', async () => {
    const service = new AuthService({
      db: {
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(async () => [
                {
                  id: 'user-1',
                  email: 'inactive@example.com',
                  firstName: 'Inactive',
                  lastName: 'User',
                  status: 'suspended',
                  passwordHash: 'hash',
                },
              ]),
            })),
          })),
        })),
      } as never,
      sessionStore: {} as SessionStore,
      sessionCookies: {} as never,
      passwordHasher: new Argon2PasswordHasher(),
      passwordPolicy: {} as never,
      permissionResolver: {} as never,
      roleResolver: {} as never,
      defaultOrganizationId: 'org-1',
    });

    await expect(
      service.getCurrentUser(
        createUserContext({
          userId: asUserId('user-1'),
          organizationId: asOrganizationId('org-1'),
          sessionId: asSessionId('session-1'),
          roles: [],
          permissions: [],
          metadata: { requestId: 'req-1' },
        }),
      ),
    ).rejects.toBeInstanceOf(AppError);
  });
});
