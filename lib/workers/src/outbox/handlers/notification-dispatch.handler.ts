import type { OutboxEvent } from '@workspace/domain/outbox';
import { OUTBOX_EVENT_NOTIFICATION_DISPATCH } from '@workspace/domain/notifications';
import {
  createSystemContext,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import type {
  Notification,
  NotificationChannel,
  NotificationDispatcher,
  NotificationPriority,
} from '@workspace/platform/notifications';

export interface NotificationDispatchHandlerDeps {
  readonly notifications: NotificationDispatcher;
}

interface NotificationDispatchPayload {
  readonly type: string;
  readonly recipientUserId: string;
  readonly recipientOrganizationId: string;
  readonly priority: NotificationPriority;
  readonly subject: string;
  readonly body: string;
  readonly actionPath?: string;
  readonly channels: readonly NotificationChannel[];
  readonly recipientEmail?: string;
  readonly idempotencyKey?: string;
}

function parsePayload(payload: Readonly<Record<string, unknown>>): NotificationDispatchPayload {
  const type = payload.type;
  const recipientUserId = payload.recipientUserId;
  const recipientOrganizationId = payload.recipientOrganizationId;
  const priority = payload.priority;
  const subject = payload.subject;
  const body = payload.body;
  const channels = payload.channels;

  if (typeof type !== 'string' || type.trim() === '') {
    throw new Error('Outbox payload missing notification type');
  }
  if (typeof recipientUserId !== 'string' || recipientUserId.trim() === '') {
    throw new Error('Outbox payload missing recipientUserId');
  }
  if (
    typeof recipientOrganizationId !== 'string' ||
    recipientOrganizationId.trim() === ''
  ) {
    throw new Error('Outbox payload missing recipientOrganizationId');
  }
  if (
    priority !== 'low' &&
    priority !== 'normal' &&
    priority !== 'high' &&
    priority !== 'critical'
  ) {
    throw new Error('Outbox payload missing valid priority');
  }
  if (typeof subject !== 'string' || subject.trim() === '') {
    throw new Error('Outbox payload missing subject');
  }
  if (typeof body !== 'string' || body.trim() === '') {
    throw new Error('Outbox payload missing body');
  }
  if (!Array.isArray(channels) || channels.length === 0) {
    throw new Error('Outbox payload missing channels');
  }

  const parsedChannels = channels.filter(
    (channel): channel is NotificationChannel =>
      channel === 'email' ||
      channel === 'in_app' ||
      channel === 'sms' ||
      channel === 'push',
  );

  if (parsedChannels.length === 0) {
    throw new Error('Outbox payload has no supported channels');
  }

  return {
    type,
    recipientUserId,
    recipientOrganizationId,
    priority,
    subject,
    body,
    ...(typeof payload.actionPath === 'string'
      ? { actionPath: payload.actionPath }
      : {}),
    channels: parsedChannels,
    ...(typeof payload.recipientEmail === 'string'
      ? { recipientEmail: payload.recipientEmail }
      : {}),
    ...(typeof payload.idempotencyKey === 'string'
      ? { idempotencyKey: payload.idempotencyKey }
      : {}),
  };
}

function buildContext(event: OutboxEvent): AuthorizationContext {
  return createSystemContext(
    { requestId: `outbox-${event.id}` },
    'notification dispatch outbox processing',
  );
}

export function createNotificationDispatchHandler(
  deps: NotificationDispatchHandlerDeps,
): (event: OutboxEvent) => Promise<void> {
  return async (event: OutboxEvent): Promise<void> => {
    if (event.eventType !== OUTBOX_EVENT_NOTIFICATION_DISPATCH) {
      throw new Error(
        `Unexpected event type for notification dispatch handler: ${event.eventType}`,
      );
    }

    const payload = parsePayload(event.payload);
    const notification: Notification = {
      type: payload.type,
      recipient: {
        userId: payload.recipientUserId,
        organizationId: payload.recipientOrganizationId,
      },
      priority: payload.priority,
      subject: payload.subject,
      body: payload.body,
      ...(payload.actionPath !== undefined ? { actionPath: payload.actionPath } : {}),
      ...(payload.idempotencyKey !== undefined
        ? { idempotencyKey: payload.idempotencyKey }
        : {}),
      data: {
        ...(payload.recipientEmail !== undefined
          ? { recipientEmail: payload.recipientEmail }
          : {}),
      },
    };

    await deps.notifications.dispatch(
      buildContext(event),
      notification,
      payload.channels,
    );
  };
}

export { OUTBOX_EVENT_NOTIFICATION_DISPATCH };
