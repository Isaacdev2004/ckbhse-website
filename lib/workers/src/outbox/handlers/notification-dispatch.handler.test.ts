import { describe, expect, it, vi } from 'vitest';
import { OUTBOX_EVENT_NOTIFICATION_DISPATCH } from '@workspace/domain/notifications';
import { NotificationDispatcher } from '@workspace/platform/notifications';
import { EmailNotificationChannelProvider } from '@workspace/platform/notifications/providers';
import { InMemoryEmailProvider } from '@workspace/platform/email';
import { createNotificationDispatchHandler } from './notification-dispatch.handler.js';

describe('createNotificationDispatchHandler', () => {
  it('dispatches notifications from outbox payload', async () => {
    const email = new InMemoryEmailProvider();
    const notifications = new NotificationDispatcher([
      new EmailNotificationChannelProvider(email),
    ]);
    const handler = createNotificationDispatchHandler({ notifications });

    await handler({
      id: 'evt-1',
      aggregateType: 'notification',
      aggregateId: 'notif-1',
      eventType: OUTBOX_EVENT_NOTIFICATION_DISPATCH,
      payload: {
        type: 'crm.lead.created',
        recipientUserId: 'user-1',
        recipientOrganizationId: 'org-1',
        priority: 'normal',
        subject: 'New lead',
        body: 'Lead created from enquiry',
        channels: ['email'],
        recipientEmail: 'staff@example.com',
      },
      status: 'pending',
      idempotencyKey: null,
      organizationId: 'org-1',
      createdAt: new Date(),
      processedAt: null,
      attemptCount: 0,
      lastError: null,
      nextAttemptAt: null,
    });

    expect(email.sent).toHaveLength(1);
  });

  it('rejects unsupported event types', async () => {
    const handler = createNotificationDispatchHandler({
      notifications: { dispatch: vi.fn() } as never,
    });

    await expect(
      handler({
        id: 'evt-1',
        aggregateType: 'notification',
        aggregateId: 'notif-1',
        eventType: 'other.event',
        payload: {},
        status: 'pending',
        idempotencyKey: null,
        organizationId: null,
        createdAt: new Date(),
        processedAt: null,
        attemptCount: 0,
        lastError: null,
        nextAttemptAt: null,
      }),
    ).rejects.toThrow(/Unexpected event type/);
  });
});
