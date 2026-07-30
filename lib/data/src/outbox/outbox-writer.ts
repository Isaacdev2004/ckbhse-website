import { outbox } from '@workspace/db/schema';
import type { OutboxEvent, OutboxEventInput } from '@workspace/domain/outbox';
import type { TransactionClient } from '../transaction/transaction-manager.js';
import { toOutboxEvent } from '../repositories/outbox.repository.js';

/**
 * Append a domain event to the outbox within an open transaction.
 *
 * Side effects are processed asynchronously by a worker; the write path only
 * records intent so the business mutation and the event share one commit.
 */
export class OutboxWriter {
  async write(
    tx: TransactionClient,
    input: OutboxEventInput,
  ): Promise<OutboxEvent> {
    const [row] = await tx
      .insert(outbox)
      .values({
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        eventType: input.eventType,
        payload: input.payload,
        organizationId: input.organizationId ?? null,
        idempotencyKey: input.idempotencyKey ?? null,
        status: 'pending',
      })
      .returning();

    if (row === undefined) {
      throw new Error('Outbox insert did not return a row');
    }

    return toOutboxEvent(row);
  }
}
