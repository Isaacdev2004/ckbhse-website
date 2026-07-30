export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export interface NotificationEvent {
  readonly type: string;
  readonly channel: NotificationChannel;
  readonly recipient: string;
  readonly templateKey: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly organizationId: string | null;
}

export const OUTBOX_EVENT_CONTACT_REQUEST_CREATED =
  'notification.contact_request.created';

export const OUTBOX_EVENT_NOTIFICATION_DISPATCH = 'notification.dispatch';
