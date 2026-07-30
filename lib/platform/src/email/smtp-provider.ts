import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { AppError } from '../errors/index.js';
import {
  assertValidEmailMessage,
  type EmailAddress,
  type EmailMessage,
  type EmailProvider,
  type EmailSendResult,
} from './index.js';

export interface SmtpEmailProviderConfig {
  readonly host: string;
  readonly port: number;
  readonly user?: string;
  readonly pass?: string;
  readonly secure: boolean;
  readonly from: EmailAddress;
}

function formatAddress(address: EmailAddress): string {
  return address.name === undefined
    ? address.email
    : `${address.name} <${address.email}>`;
}

function formatAddressList(addresses: readonly EmailAddress[] | undefined): string | undefined {
  if (addresses === undefined || addresses.length === 0) {
    return undefined;
  }
  return addresses.map(formatAddress).join(', ');
}

function mapTransportError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : 'SMTP delivery failed unexpectedly';

  if (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    (error.code === 'EAUTH' || error.code === 'ESOCKET' || error.code === 'ECONNECTION')
  ) {
    return AppError.serviceUnavailable('Email provider is unavailable');
  }

  return AppError.internal(message, error);
}

/**
 * Production SMTP adapter backed by nodemailer.
 *
 * Validates every message before it reaches the transport so malformed
 * recipients fail synchronously rather than as silent non-delivery.
 */
export class SmtpEmailProvider implements EmailProvider {
  readonly name = 'smtp';

  private readonly transporter: Transporter;
  private readonly from: EmailAddress;

  constructor(config: SmtpEmailProviderConfig, transporter?: Transporter) {
    this.from = config.from;
    this.transporter =
      transporter ??
      nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        ...(config.user !== undefined && config.pass !== undefined
          ? { auth: { user: config.user, pass: config.pass } }
          : {}),
      });
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    assertValidEmailMessage(message);

    const from = message.from ?? this.from;

    try {
      const result = await this.transporter.sendMail({
        from: formatAddress(from),
        to: formatAddressList(message.to),
        cc: formatAddressList(message.cc),
        bcc: formatAddressList(message.bcc),
        replyTo: message.replyTo === undefined ? undefined : formatAddress(message.replyTo),
        subject: message.subject,
        text: message.text,
        html: message.html,
        headers:
          message.idempotencyKey === undefined
            ? undefined
            : { 'X-Idempotency-Key': message.idempotencyKey },
      });

      const accepted = Array.isArray(result.accepted)
        ? result.accepted.map(String)
        : message.to.map((recipient) => recipient.email);
      const rejected = Array.isArray(result.rejected)
        ? result.rejected.map(String)
        : [];

      if (accepted.length === 0 && rejected.length > 0) {
        throw AppError.serviceUnavailable('Email provider rejected all recipients');
      }

      const providerMessageId =
        typeof result.messageId === 'string' && result.messageId.length > 0
          ? result.messageId
          : `smtp-${Date.now()}`;

      return {
        providerMessageId,
        accepted,
        rejected,
      };
    } catch (error) {
      throw mapTransportError(error);
    }
  }
}
