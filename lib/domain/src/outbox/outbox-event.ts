export type OutboxEventStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'dead_letter';

export interface OutboxEvent {
  readonly id: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly status: OutboxEventStatus;
  readonly idempotencyKey: string | null;
  readonly organizationId: string | null;
  readonly createdAt: Date;
  readonly processedAt: Date | null;
  readonly attemptCount: number;
  readonly lastError: string | null;
  readonly nextAttemptAt: Date | null;
}

export interface OutboxEventInput {
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly idempotencyKey?: string | null;
  readonly organizationId?: string | null;
}
