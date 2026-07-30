import { describe, expect, it } from 'vitest';
import {
  asOrganizationId,
  asUserId,
  createUserContext,
} from '../../authorization/index.js';
import { InMemoryEmailProvider } from '../../email/index.js';
import {
  EmailNotificationChannelProvider,
  InAppNotificationChannelProvider,
} from './index.js';
import { NotificationDispatcher } from '../index.js';

const context = createUserContext({
  userId: asUserId('user-1'),
  organizationId: asOrganizationId('org-1'),
  permissions: [],
  metadata: { requestId: 'req-1' },
});

describe('notification channel providers', () => {
  it('delivers email when recipientEmail is present', async () => {
    const email = new InMemoryEmailProvider();
    const dispatcher = new NotificationDispatcher([
      new EmailNotificationChannelProvider(email),
    ]);

    const results = await dispatcher.dispatch(
      context,
      {
        type: 'crm.lead.created',
        recipient: { userId: 'user-1', organizationId: 'org-1' },
        priority: 'normal',
        subject: 'New lead',
        body: 'A lead was created',
        data: { recipientEmail: 'staff@example.com' },
      },
      ['email'],
    );

    expect(results[0]?.delivered).toBe(true);
    expect(email.sent).toHaveLength(1);
  });

  it('stores in-app notifications in memory', async () => {
    const inApp = new InAppNotificationChannelProvider();
    const dispatcher = new NotificationDispatcher([inApp]);

    await dispatcher.dispatch(
      context,
      {
        type: 'cms.review.due',
        recipient: { userId: 'user-1', organizationId: 'org-1' },
        priority: 'high',
        subject: 'Review due',
        body: 'Content needs review',
      },
      ['in_app'],
    );

    expect(inApp.listForUser('user-1')).toHaveLength(1);
  });
});
