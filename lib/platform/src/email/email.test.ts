import { describe, expect, it } from 'vitest';
import {
  InMemoryEmailProvider,
  assertValidEmailMessage,
  type EmailMessage,
} from './index.js';

function message(overrides: Partial<EmailMessage> = {}): EmailMessage {
  return {
    to: [{ email: 'client@example.com', name: 'Client' }],
    subject: 'Your audit report is ready',
    text: 'Sign in to the portal to download your report.',
    ...overrides,
  };
}

describe('assertValidEmailMessage', () => {
  it('accepts a well-formed message', () => {
    expect(() => assertValidEmailMessage(message())).not.toThrow();
  });

  it('requires at least one recipient', () => {
    expect(() => assertValidEmailMessage(message({ to: [] }))).toThrowError(
      /at least one recipient/,
    );
  });

  it('counts a bcc-only message as addressed', () => {
    expect(() =>
      assertValidEmailMessage(
        message({ to: [], bcc: [{ email: 'archive@example.com' }] }),
      ),
    ).not.toThrow();
  });

  it('rejects a malformed address', () => {
    // Providers report these as opaque 4xx responses that surface as a failed
    // job hours later, so they are worth catching synchronously.
    expect(() =>
      assertValidEmailMessage(message({ to: [{ email: 'not-an-address' }] })),
    ).toThrowError(/Invalid email address/);
  });

  it('validates cc and bcc as well as to', () => {
    expect(() =>
      assertValidEmailMessage(message({ cc: [{ email: 'broken@' }] })),
    ).toThrowError(/Invalid email address/);
  });

  it('requires a subject', () => {
    expect(() =>
      assertValidEmailMessage(message({ subject: '  ' })),
    ).toThrowError(/requires a subject/);
  });

  it('requires a plain-text body', () => {
    // A message with only HTML is penalised by spam filters and unreadable in
    // text-only and accessibility-focused clients.
    expect(() =>
      assertValidEmailMessage(message({ text: '', html: '<p>Hello</p>' })),
    ).toThrowError(/plain-text body/);
  });
});

describe('InMemoryEmailProvider', () => {
  it('captures instead of sending', async () => {
    const provider = new InMemoryEmailProvider();

    await provider.send(message());

    // The default in development and test: a misconfigured environment cannot
    // email a real client.
    expect(provider.sent).toHaveLength(1);
    expect(provider.sent[0]?.subject).toBe('Your audit report is ready');
  });

  it('reports every recipient as accepted', async () => {
    const provider = new InMemoryEmailProvider();

    const result = await provider.send(
      message({
        to: [{ email: 'a@example.com' }],
        cc: [{ email: 'b@example.com' }],
        bcc: [{ email: 'c@example.com' }],
      }),
    );

    expect(result.accepted).toEqual([
      'a@example.com',
      'b@example.com',
      'c@example.com',
    ]);
    expect(result.rejected).toEqual([]);
  });

  it('returns a distinct provider message id per send', async () => {
    const provider = new InMemoryEmailProvider();

    const first = await provider.send(message());
    const second = await provider.send(message());

    expect(first.providerMessageId).not.toBe(second.providerMessageId);
  });

  it('validates before capturing', async () => {
    const provider = new InMemoryEmailProvider();

    await expect(provider.send(message({ subject: '' }))).rejects.toMatchObject(
      {
        code: 'bad_request',
      },
    );
    expect(provider.sent).toHaveLength(0);
  });
});
