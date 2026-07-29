/**
 * Notification abstraction.
 *
 * A notification is *what happened*; a channel is *how it is delivered*. Keeping
 * them separate is what lets a user mute SMS without muting the event, and lets a
 * new channel be added without touching any domain code.
 *
 * The dispatcher does not send anything itself. Delivery is a background job
 * (see `../jobs`), because a request that blocks on an email provider fails when
 * that provider is slow.
 *
 * No channel providers in this phase.
 */

import { AppError } from '../errors/index.js';
import type { AuthorizationContext } from '../authorization/index.js';

export type NotificationChannel = 'email' | 'in_app' | 'sms' | 'push';

export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] =
  Object.freeze(['email', 'in_app', 'sms', 'push']);

/**
 * How urgent, which determines batching rather than styling. `critical` bypasses
 * digest batching and quiet hours; everything else can be held and grouped.
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface NotificationRecipient {
  readonly userId: string;
  readonly organizationId: string;
}

export interface Notification {
  /** Stable key identifying the event type, e.g. `training.certificate.issued`. */
  readonly type: string;
  readonly recipient: NotificationRecipient;
  readonly priority: NotificationPriority;
  readonly subject: string;
  readonly body: string;
  /**
   * Where the notification leads. Relative to the application origin, so a
   * notification cannot be used to drive a user to an external site.
   */
  readonly actionPath?: string;
  readonly data?: Readonly<Record<string, unknown>>;
  /** Suppresses duplicates when a job retries or an event fires twice. */
  readonly idempotencyKey?: string;
}

export interface NotificationDeliveryResult {
  readonly channel: NotificationChannel;
  readonly delivered: boolean;
  readonly reason?: string;
}

/** A single delivery mechanism. One implementation per channel. */
export interface NotificationChannelProvider {
  readonly channel: NotificationChannel;
  /**
   * Whether this provider can reach the recipient at all — no verified phone
   * number means no SMS. Checked before delivery so an unreachable recipient is
   * a skip rather than a failed job.
   */
  supports(notification: Notification): Promise<boolean>;
  deliver(notification: Notification): Promise<NotificationDeliveryResult>;
}

/**
 * A user's per-channel opt-outs.
 *
 * `critical` notifications ignore preferences: a suspended account or a security
 * alert must reach its recipient, and letting it be muted turns a compliance
 * obligation into a setting.
 */
export interface NotificationPreferences {
  readonly userId: string;
  readonly mutedChannels: ReadonlySet<NotificationChannel>;
  readonly mutedTypes: ReadonlySet<string>;
}

export interface NotificationPreferenceStore {
  get(
    context: AuthorizationContext,
    userId: string,
  ): Promise<NotificationPreferences | null>;
}

export function isChannelPermitted(
  notification: Notification,
  channel: NotificationChannel,
  preferences: NotificationPreferences | null,
): boolean {
  if (notification.priority === 'critical') return true;
  if (preferences === null) return true;

  if (preferences.mutedChannels.has(channel)) return false;
  if (preferences.mutedTypes.has(notification.type)) return false;

  return true;
}

export function assertValidNotification(notification: Notification): void {
  if (notification.type.trim() === '') {
    throw AppError.internal('A notification requires a type');
  }

  if (notification.subject.trim() === '') {
    throw AppError.internal('A notification requires a subject');
  }

  // An absolute URL here would let a notification template become an open
  // redirect, so only in-application paths are accepted.
  if (
    notification.actionPath !== undefined &&
    !notification.actionPath.startsWith('/')
  ) {
    throw AppError.internal(
      'A notification action path must be application-relative',
    );
  }
}

/**
 * Routes a notification to the channels that are registered, capable and
 * permitted.
 *
 * Every channel is attempted independently: SMS being unavailable must not stop
 * the in-app copy from appearing, so one channel's failure is recorded rather
 * than propagated.
 */
export class NotificationDispatcher {
  private readonly providers = new Map<
    NotificationChannel,
    NotificationChannelProvider
  >();

  constructor(
    providers: readonly NotificationChannelProvider[] = [],
    private readonly preferenceStore?: NotificationPreferenceStore,
  ) {
    for (const provider of providers) {
      this.providers.set(provider.channel, provider);
    }
  }

  register(provider: NotificationChannelProvider): void {
    this.providers.set(provider.channel, provider);
  }

  get registeredChannels(): readonly NotificationChannel[] {
    return [...this.providers.keys()];
  }

  async dispatch(
    context: AuthorizationContext,
    notification: Notification,
    channels: readonly NotificationChannel[],
  ): Promise<readonly NotificationDeliveryResult[]> {
    assertValidNotification(notification);

    const preferences =
      (await this.preferenceStore?.get(
        context,
        notification.recipient.userId,
      )) ?? null;

    const results: NotificationDeliveryResult[] = [];

    for (const channel of channels) {
      const provider = this.providers.get(channel);

      if (!provider) {
        results.push({
          channel,
          delivered: false,
          reason: 'no provider registered',
        });
        continue;
      }

      if (!isChannelPermitted(notification, channel, preferences)) {
        results.push({
          channel,
          delivered: false,
          reason: 'muted by recipient',
        });
        continue;
      }

      if (!(await provider.supports(notification))) {
        results.push({
          channel,
          delivered: false,
          reason: 'recipient unreachable',
        });
        continue;
      }

      results.push(await provider.deliver(notification));
    }

    return results;
  }
}
