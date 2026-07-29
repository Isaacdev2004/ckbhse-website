/**
 * Email provider abstraction.
 *
 * Deliberately vendor-neutral. The interface is the intersection of what Resend,
 * SendGrid, Amazon SES and Postmark all support, so adopting or replacing one is
 * an adapter change rather than a call-site change. Nothing vendor-specific
 * (Resend's React templates, SES configuration sets) appears here; an adapter
 * that needs those accepts them in its own constructor.
 *
 * No credentials and no live sending in this phase.
 */

import { AppError } from '../errors/index.js';

export interface EmailAddress {
  readonly email: string;
  readonly name?: string;
}

export interface EmailAttachment {
  readonly filename: string;
  readonly content: Uint8Array;
  readonly contentType: string;
}

export interface EmailMessage {
  readonly to: readonly EmailAddress[];
  readonly cc?: readonly EmailAddress[];
  readonly bcc?: readonly EmailAddress[];
  readonly from?: EmailAddress;
  readonly replyTo?: EmailAddress;
  readonly subject: string;
  /**
   * A text alternative is required, not optional: a message without one is
   * penalised by spam filters and unreadable in accessibility-focused clients.
   */
  readonly text: string;
  readonly html?: string;
  readonly attachments?: readonly EmailAttachment[];
  /**
   * Caller-supplied idempotency key. Providers that support it will not send
   * twice for the same key, which is what makes a job retry safe.
   */
  readonly idempotencyKey?: string;
  /** Provider-agnostic tags for delivery analytics. */
  readonly tags?: Readonly<Record<string, string>>;
}

export interface EmailSendResult {
  /** The provider's identifier, needed to correlate webhooks and bounces. */
  readonly providerMessageId: string;
  readonly accepted: readonly string[];
  readonly rejected: readonly string[];
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailSendResult>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a message before it reaches a provider.
 *
 * Providers report these as opaque 4xx responses that surface as failed jobs
 * hours later, so catching them at the boundary is the difference between a
 * synchronous error and a silent non-delivery.
 */
export function assertValidEmailMessage(message: EmailMessage): void {
  const recipients = [
    ...message.to,
    ...(message.cc ?? []),
    ...(message.bcc ?? []),
  ];

  if (recipients.length === 0) {
    throw AppError.badRequest('An email requires at least one recipient');
  }

  for (const recipient of recipients) {
    if (!EMAIL_PATTERN.test(recipient.email)) {
      throw AppError.badRequest(`Invalid email address: ${recipient.email}`);
    }
  }

  if (message.subject.trim() === '') {
    throw AppError.badRequest('An email requires a subject');
  }

  if (message.text.trim() === '') {
    throw AppError.badRequest('An email requires a plain-text body');
  }
}

/**
 * Captures messages instead of sending them.
 *
 * The default provider in development and test: a misconfigured environment
 * cannot email a real client, and tests assert on `sent` rather than mocking a
 * transport.
 */
export class InMemoryEmailProvider implements EmailProvider {
  readonly name = 'in-memory';

  private readonly messages: EmailMessage[] = [];
  private counter = 0;

  // `async` so a validation failure surfaces as a rejection rather than a
  // synchronous throw. A method typed `Promise<T>` that sometimes throws before
  // returning forces callers to write both a try/catch and a `.catch()`.
  async send(message: EmailMessage): Promise<EmailSendResult> {
    assertValidEmailMessage(message);

    this.counter += 1;
    this.messages.push(message);

    const recipients = [
      ...message.to,
      ...(message.cc ?? []),
      ...(message.bcc ?? []),
    ].map((recipient) => recipient.email);

    return {
      providerMessageId: `in-memory-${this.counter}`,
      accepted: recipients,
      rejected: [],
    };
  }

  get sent(): readonly EmailMessage[] {
    return this.messages;
  }

  clear(): void {
    this.messages.length = 0;
    this.counter = 0;
  }
}
