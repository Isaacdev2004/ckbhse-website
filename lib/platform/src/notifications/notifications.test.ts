import { describe, expect, it } from 'vitest';
import {
  asOrganizationId,
  asUserId,
  createUserContext,
} from '../authorization/index.js';
import { PERMISSIONS } from '../permissions/index.js';
import {
  NotificationDispatcher,
  isChannelPermitted,
  type Notification,
  type NotificationChannel,
  type NotificationChannelProvider,
  type NotificationPreferences,
} from './index.js';

const context = createUserContext({
  userId: asUserId('user-1'),
  organizationId: asOrganizationId('org-1'),
  permissions: [PERMISSIONS.PORTAL_ACCESS],
  metadata: { requestId: 'req-1' },
});

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    type: 'training.certificate.issued',
    recipient: { userId: 'user-1', organizationId: 'org-1' },
    priority: 'normal',
    subject: 'Your certificate is ready',
    body: 'Download it from your training record.',
    ...overrides,
  };
}

function recordingProvider(
  channel: NotificationChannel,
  options: { supports?: boolean; delivered?: boolean } = {},
): NotificationChannelProvider & { calls: number } {
  return {
    channel,
    calls: 0,
    supports: () => Promise.resolve(options.supports ?? true),
    deliver(this: { calls: number }) {
      this.calls += 1;
      return Promise.resolve({
        channel,
        delivered: options.delivered ?? true,
      });
    },
  };
}

function preferences(
  overrides: Partial<NotificationPreferences> = {},
): NotificationPreferences {
  return {
    userId: 'user-1',
    mutedChannels: new Set(),
    mutedTypes: new Set(),
    ...overrides,
  };
}

describe('isChannelPermitted', () => {
  it('permits when there are no preferences', () => {
    expect(isChannelPermitted(notification(), 'email', null)).toBe(true);
  });

  it('respects a muted channel', () => {
    expect(
      isChannelPermitted(
        notification(),
        'sms',
        preferences({ mutedChannels: new Set(['sms']) }),
      ),
    ).toBe(false);
  });

  it('respects a muted type', () => {
    expect(
      isChannelPermitted(
        notification(),
        'email',
        preferences({
          mutedTypes: new Set(['training.certificate.issued']),
        }),
      ),
    ).toBe(false);
  });

  it('overrides preferences for critical notifications', () => {
    // A suspended account or security alert must reach its recipient; letting it
    // be muted would turn a compliance obligation into a setting.
    expect(
      isChannelPermitted(
        notification({ priority: 'critical' }),
        'email',
        preferences({ mutedChannels: new Set(['email']) }),
      ),
    ).toBe(true);
  });
});

describe('NotificationDispatcher', () => {
  it('delivers on each registered channel', async () => {
    const email = recordingProvider('email');
    const inApp = recordingProvider('in_app');
    const dispatcher = new NotificationDispatcher([email, inApp]);

    const results = await dispatcher.dispatch(context, notification(), [
      'email',
      'in_app',
    ]);

    expect(results.every((result) => result.delivered)).toBe(true);
    expect(email.calls).toBe(1);
    expect(inApp.calls).toBe(1);
  });

  it('reports an unregistered channel without failing the rest', async () => {
    const inApp = recordingProvider('in_app');
    const dispatcher = new NotificationDispatcher([inApp]);

    const results = await dispatcher.dispatch(context, notification(), [
      'sms',
      'in_app',
    ]);

    // SMS being unavailable must not stop the in-app copy from appearing.
    expect(results[0]).toEqual({
      channel: 'sms',
      delivered: false,
      reason: 'no provider registered',
    });
    expect(inApp.calls).toBe(1);
  });

  it('skips a channel that cannot reach the recipient', async () => {
    const sms = recordingProvider('sms', { supports: false });
    const dispatcher = new NotificationDispatcher([sms]);

    const results = await dispatcher.dispatch(context, notification(), ['sms']);

    expect(results[0]?.reason).toBe('recipient unreachable');
    expect(sms.calls).toBe(0);
  });

  it('honours preferences from the store', async () => {
    const email = recordingProvider('email');
    const dispatcher = new NotificationDispatcher([email], {
      get: () =>
        Promise.resolve(preferences({ mutedChannels: new Set(['email']) })),
    });

    const results = await dispatcher.dispatch(context, notification(), [
      'email',
    ]);

    expect(results[0]?.reason).toBe('muted by recipient');
    expect(email.calls).toBe(0);
  });

  it('rejects an absolute action path', async () => {
    const dispatcher = new NotificationDispatcher([recordingProvider('email')]);

    // An absolute URL would make a notification template an open redirect.
    await expect(
      dispatcher.dispatch(
        context,
        notification({ actionPath: 'https://evil.example.com' }),
        ['email'],
      ),
    ).rejects.toMatchObject({ code: 'internal_error' });
  });

  it('accepts an application-relative action path', async () => {
    const dispatcher = new NotificationDispatcher([recordingProvider('email')]);

    await expect(
      dispatcher.dispatch(
        context,
        notification({ actionPath: '/portal/training/certificates' }),
        ['email'],
      ),
    ).resolves.toHaveLength(1);
  });

  it('reports its registered channels', () => {
    const dispatcher = new NotificationDispatcher([
      recordingProvider('email'),
      recordingProvider('push'),
    ]);

    expect(dispatcher.registeredChannels).toEqual(['email', 'push']);
  });
});
