import type {
  Notification,
  NotificationChannelProvider,
  NotificationDeliveryResult,
} from '../index.js';

export interface InAppNotificationRecord {
  readonly id: string;
  readonly notification: Notification;
  readonly createdAt: Date;
  readonly read: boolean;
}

/** Development-friendly in-app notification sink. */
export class InAppNotificationChannelProvider implements NotificationChannelProvider {
  readonly channel = 'in_app' as const;

  private readonly records: InAppNotificationRecord[] = [];
  private counter = 0;

  supports(): Promise<boolean> {
    return Promise.resolve(true);
  }

  deliver(notification: Notification): Promise<NotificationDeliveryResult> {
    this.counter += 1;
    this.records.push({
      id: `in-app-${this.counter}`,
      notification,
      createdAt: new Date(),
      read: false,
    });

    return Promise.resolve({ channel: 'in_app', delivered: true });
  }

  listForUser(userId: string): readonly InAppNotificationRecord[] {
    return this.records.filter(
      (record) => record.notification.recipient.userId === userId,
    );
  }

  clear(): void {
    this.records.length = 0;
    this.counter = 0;
  }
}
