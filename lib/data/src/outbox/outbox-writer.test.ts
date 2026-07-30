import { describe, expect, it } from 'vitest';
import { OutboxWriter } from './outbox-writer.js';
import type { TransactionClient } from '../transaction/transaction-manager.js';

describe('OutboxWriter', () => {
  it('writes an outbox row through the supplied transaction client', async () => {
    const returningRow = {
      id: 'evt-1',
      aggregateType: 'ContactRequest',
      aggregateId: 'cr-1',
      eventType: 'crm.contact_request.created',
      payload: { contactRequestId: 'cr-1' },
      status: 'pending' as const,
      idempotencyKey: 'key-1',
      organizationId: 'org-1',
      createdAt: new Date('2026-07-29T10:00:00.000Z'),
      updatedAt: new Date('2026-07-29T10:00:00.000Z'),
      deletedAt: null,
      attemptCount: 0,
      lastError: null,
      processedAt: null,
    };

    const tx = {
      insert: () => ({
        values: () => ({
          returning: async () => [returningRow],
        }),
      }),
    } as unknown as TransactionClient;

    const writer = new OutboxWriter();
    const event = await writer.write(tx, {
      aggregateType: 'ContactRequest',
      aggregateId: 'cr-1',
      eventType: 'crm.contact_request.created',
      payload: { contactRequestId: 'cr-1' },
      organizationId: 'org-1',
      idempotencyKey: 'key-1',
    });

    expect(event.id).toBe('evt-1');
    expect(event.status).toBe('pending');
    expect(event.payload).toEqual({ contactRequestId: 'cr-1' });
  });
});
