import { renderTemplate, type RenderedEmail } from '@workspace/email-templates';
import {
  assertValidEmailMessage,
  type EmailProvider,
} from '@workspace/platform/email';

export interface CrmEmailServiceDeps {
  readonly email: EmailProvider;
  readonly supportEmail: string;
  readonly fromEmail?: string;
  readonly fromName?: string;
}

export class CrmEmailService {
  private readonly email: EmailProvider;
  private readonly supportEmail: string;
  private readonly from: { email: string; name: string };

  constructor(deps: CrmEmailServiceDeps) {
    this.email = deps.email;
    this.supportEmail = deps.supportEmail;
    this.from = {
      email: deps.fromEmail ?? 'noreply@ckbhse.co.uk',
      name: deps.fromName ?? 'CKBHSE',
    };
  }

  async sendToAddress(
    to: string,
    rendered: RenderedEmail,
    options: { idempotencyKey?: string } = {},
  ): Promise<void> {
    const message = {
      to: [{ email: to }],
      from: this.from,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      ...(options.idempotencyKey !== undefined
        ? { idempotencyKey: options.idempotencyKey }
        : {}),
    };
    assertValidEmailMessage(message);
    await this.email.send(message);
  }

  async sendToSupport(
    rendered: RenderedEmail,
    options: { idempotencyKey?: string } = {},
  ): Promise<void> {
    await this.sendToAddress(this.supportEmail, rendered, options);
  }
}

export { renderTemplate };
