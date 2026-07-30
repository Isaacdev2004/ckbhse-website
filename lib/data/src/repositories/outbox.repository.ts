import { outbox } from '@workspace/db/schema';

type OutboxRow = typeof outbox.$inferSelect;
import type { OutboxEvent, OutboxEventStatus } from '@workspace/domain/outbox';
import { and, eq, lte, or, isNull, sql } from 'drizzle-orm';
import type { DbExecutor } from '../transaction/transaction-manager.js';

export function toOutboxEvent(row: OutboxRow): OutboxEvent {
  return {
    id: row.id,
    aggregateType: row.aggregateType,
    aggregateId: row.aggregateId,
    eventType: row.eventType,
    payload: row.payload as Readonly<Record<string, unknown>>,
    status: row.status as OutboxEventStatus,
    idempotencyKey: row.idempotencyKey ?? null,
    organizationId: row.organizationId ?? null,
    createdAt: row.createdAt,
    processedAt: row.processedAt ?? null,
    attemptCount: row.attemptCount,
    lastError: row.lastError ?? null,
    nextAttemptAt: row.nextAttemptAt ?? null,
  };
}

export class OutboxRepository {
  constructor(private readonly db: DbExecutor) {}

  async findById(id: string): Promise<OutboxEvent | null> {
    const rows = await this.db
      .select()
      .from(outbox)
      .where(eq(outbox.id, id))
      .limit(1);

    const row = rows[0];
    return row === undefined ? null : toOutboxEvent(row);
  }

  async listPending(limit = 50): Promise<readonly OutboxEvent[]> {
    const now = new Date();
    const rows = await this.db
      .select()
      .from(outbox)
      .where(
        and(
          eq(outbox.status, 'pending'),
          or(isNull(outbox.nextAttemptAt), lte(outbox.nextAttemptAt, now)),
        ),
      )
      .orderBy(outbox.createdAt)
      .limit(limit);

    return rows.map(toOutboxEvent);
  }

  async markProcessing(id: string): Promise<OutboxEvent | null> {
    const [row] = await this.db
      .update(outbox)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(and(eq(outbox.id, id), eq(outbox.status, 'pending')))
      .returning();

    return row === undefined ? null : toOutboxEvent(row);
  }

  async markCompleted(id: string): Promise<OutboxEvent | null> {
    const now = new Date();
    const [row] = await this.db
      .update(outbox)
      .set({
        status: 'completed',
        processedAt: now,
        updatedAt: now,
      })
      .where(eq(outbox.id, id))
      .returning();

    return row === undefined ? null : toOutboxEvent(row);
  }

  async markFailed(id: string, error: string): Promise<OutboxEvent | null> {
    const existing = await this.findById(id);
    if (existing === null) return null;

    const [row] = await this.db
      .update(outbox)
      .set({
        status: 'failed',
        lastError: error,
        attemptCount: existing.attemptCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(outbox.id, id))
      .returning();

    return row === undefined ? null : toOutboxEvent(row);
  }

  async scheduleRetry(
    id: string,
    error: string,
    nextAttemptAt: Date,
  ): Promise<OutboxEvent | null> {
    const existing = await this.findById(id);
    if (existing === null) return null;

    const [row] = await this.db
      .update(outbox)
      .set({
        status: 'pending',
        lastError: error,
        attemptCount: existing.attemptCount + 1,
        nextAttemptAt,
        updatedAt: new Date(),
      })
      .where(eq(outbox.id, id))
      .returning();

    return row === undefined ? null : toOutboxEvent(row);
  }

  async markDeadLetter(id: string, error: string): Promise<OutboxEvent | null> {
    const existing = await this.findById(id);
    if (existing === null) return null;

    const [row] = await this.db
      .update(outbox)
      .set({
        status: 'dead_letter',
        lastError: error,
        attemptCount: existing.attemptCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(outbox.id, id))
      .returning();

    return row === undefined ? null : toOutboxEvent(row);
  }

  async countByStatus(): Promise<Readonly<Record<string, number>>> {
    const rows = await this.db
      .select({
        status: outbox.status,
        count: sql<number>`count(*)::int`,
      })
      .from(outbox)
      .groupBy(outbox.status);

    return Object.fromEntries(rows.map((row) => [row.status, row.count]));
  }
}
