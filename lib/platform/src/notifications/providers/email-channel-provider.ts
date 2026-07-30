import type { EmailProvider } from '../../email/index.js';
import type {
  Notification,
  NotificationChannelProvider,
  NotificationDeliveryResult,
} from '../index.js';

function readRecipientEmail(notification: Notification): string | null {
  const email = notification.data?.recipientEmail;
  return typeof email === 'string' && email.trim().length > 0 ? email.trim() : null;
}

/** Delivers platform notifications through the configured email provider. */
export class EmailNotificationChannelProvider implements NotificationChannelProvider {
  readonly channel = 'email' as const;

  constructor(private readonly email: EmailProvider) {}

  supports(notification: Notification): Promise<boolean> {
    return Promise.resolve(readRecipientEmail(notification) !== null);
  }

  async deliver(notification: Notification): Promise<NotificationDeliveryResult> {
    const recipientEmail = readRecipientEmail(notification);
    if (recipientEmail === null) {
      return {
        channel: 'email',
        delivered: false,
        reason: 'recipient unreachable',
      };
    }

    await this.email.send({
      to: [{ email: recipientEmail }],
      subject: notification.subject,
      text: notification.body,
      ...(notification.idempotencyKey !== undefined
        ? { idempotencyKey: notification.idempotencyKey }
        : {}),
      tags: {
        notificationType: notification.type,
        organizationId: notification.recipient.organizationId,
      },
    });

    return { channel: 'email', delivered: true };
  }
}
