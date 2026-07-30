import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Transporter } from 'nodemailer';
import { AppError } from '../errors/index.js';
import { SmtpEmailProvider } from './smtp-provider.js';
import type { EmailMessage } from './index.js';

function message(overrides: Partial<EmailMessage> = {}): EmailMessage {
  return {
    to: [{ email: 'client@example.com', name: 'Client' }],
    subject: 'Your audit report is ready',
    text: 'Sign in to the portal to download your report.',
    ...overrides,
  };
}

function createTransporterMock(result: {
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
} = {}) {
  return {
    sendMail: vi.fn(async () => ({
      messageId: result.messageId ?? '<smtp-1@example.com>',
      accepted: result.accepted ?? ['client@example.com'],
      rejected: result.rejected ?? [],
    })),
  } as unknown as Transporter;
}

describe('SmtpEmailProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends a validated message through the transport', async () => {
    const transporter = createTransporterMock();
    const provider = new SmtpEmailProvider(
      {
        host: 'smtp.example.com',
        port: 587,
        user: 'apikey',
        pass: 'secret',
        secure: false,
        from: { email: 'noreply@ckbhse.example', name: 'CKBHSE' },
      },
      transporter,
    );

    const result = await provider.send(message());

    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'CKBHSE <noreply@ckbhse.example>',
        to: 'Client <client@example.com>',
        subject: 'Your audit report is ready',
        text: 'Sign in to the portal to download your report.',
      }),
    );
    expect(result.providerMessageId).toBe('<smtp-1@example.com>');
    expect(result.accepted).toEqual(['client@example.com']);
  });

  it('validates before sending', async () => {
    const transporter = createTransporterMock();
    const provider = new SmtpEmailProvider(
      {
        host: 'smtp.example.com',
        port: 587,
        user: 'apikey',
        pass: 'secret',
        secure: false,
        from: { email: 'noreply@ckbhse.example' },
      },
      transporter,
    );

    await expect(provider.send(message({ subject: '' }))).rejects.toMatchObject({
      code: 'bad_request',
    });
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it('maps transport auth failures to service unavailable', async () => {
    const transporter = {
      sendMail: vi.fn(async () => {
        const error = new Error('Invalid login') as Error & { code: string };
        error.code = 'EAUTH';
        throw error;
      }),
    } as unknown as Transporter;

    const provider = new SmtpEmailProvider(
      {
        host: 'smtp.example.com',
        port: 587,
        user: 'apikey',
        pass: 'wrong',
        secure: false,
        from: { email: 'noreply@ckbhse.example' },
      },
      transporter,
    );

    await expect(provider.send(message())).rejects.toBeInstanceOf(AppError);
    await expect(provider.send(message())).rejects.toMatchObject({
      code: 'service_unavailable',
    });
  });

  it('reports rejected recipients as service unavailable', async () => {
    const transporter = createTransporterMock({
      accepted: [],
      rejected: ['client@example.com'],
    });
    const provider = new SmtpEmailProvider(
      {
        host: 'smtp.example.com',
        port: 587,
        user: 'apikey',
        pass: 'secret',
        secure: false,
        from: { email: 'noreply@ckbhse.example' },
      },
      transporter,
    );

    await expect(provider.send(message())).rejects.toMatchObject({
      code: 'service_unavailable',
    });
  });
});
