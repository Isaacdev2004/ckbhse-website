import type { OutboxEvent } from '@workspace/domain/outbox';

export type OutboxEventHandler = (event: OutboxEvent) => Promise<void>;

/** Subset of OutboxRepository used by the worker (also satisfied by test mocks). */
export interface OutboxWorkerRepository {
  listPending(limit?: number): Promise<readonly OutboxEvent[]>;
  markProcessing(id: string): Promise<OutboxEvent | null>;
  markCompleted(id: string): Promise<OutboxEvent | null>;
  scheduleRetry(
    id: string,
    error: string,
    nextAttemptAt: Date,
  ): Promise<OutboxEvent | null>;
  markDeadLetter(id: string, error: string): Promise<OutboxEvent | null>;
}

export interface OutboxWorkerConfig {
  readonly pollingIntervalMs: number;
  readonly batchSize: number;
  readonly maxAttempts: number;
  /** Base delay for exponential backoff (ms). */
  readonly baseBackoffMs: number;
  readonly maxBackoffMs?: number;
}

export interface OutboxWorkerMetrics {
  processed: number;
  failed: number;
  deadLetter: number;
  retried: number;
}

export interface OutboxWorkerDeps {
  readonly repository: OutboxWorkerRepository;
  readonly handlers: Map<string, OutboxEventHandler>;
  readonly config: OutboxWorkerConfig;
  readonly now?: () => Date;
}

const DEFAULT_MAX_BACKOFF_MS = 60 * 60 * 1000;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Polls the transactional outbox and dispatches events to registered handlers.
 *
 * Handlers must be idempotent: at-least-once delivery is the only guarantee.
 * Failed events are retried with exponential backoff until maxAttempts, then
 * moved to dead letter for manual review.
 */
export class OutboxWorker {
  private readonly repository: OutboxWorkerRepository;
  private readonly handlers: Map<string, OutboxEventHandler>;
  private readonly config: OutboxWorkerConfig;
  private readonly now: () => Date;

  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private accepting = false;
  private batchInFlight: Promise<void> | null = null;

  readonly metrics: OutboxWorkerMetrics = {
    processed: 0,
    failed: 0,
    deadLetter: 0,
    retried: 0,
  };

  constructor(deps: OutboxWorkerDeps) {
    this.repository = deps.repository;
    this.handlers = deps.handlers;
    this.config = deps.config;
    this.now = deps.now ?? (() => new Date());
  }

  registerHandler(eventType: string, handler: OutboxEventHandler): void {
    this.handlers.set(eventType, handler);
  }

  start(): void {
    if (this.accepting) {
      return;
    }

    this.accepting = true;
    this.intervalHandle = setInterval(() => {
      void this.tick();
    }, this.config.pollingIntervalMs);

    void this.tick();
  }

  /**
   * Stop accepting new batches. The in-flight batch, if any, is allowed to finish.
   */
  async stop(): Promise<void> {
    this.accepting = false;

    if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }

    if (this.batchInFlight !== null) {
      await this.batchInFlight;
    }
  }

  /** Process one batch synchronously (for tests and manual drains). */
  async processBatch(): Promise<void> {
    const events = await this.repository.listPending(this.config.batchSize);

    for (const event of events) {
      await this.processEvent(event);
    }
  }

  private async tick(): Promise<void> {
    if (!this.accepting || this.running) {
      return;
    }

    this.running = true;
    this.batchInFlight = this.processBatch().finally(() => {
      this.running = false;
      this.batchInFlight = null;
    });

    await this.batchInFlight;
  }

  private async processEvent(event: OutboxEvent): Promise<void> {
    const claimed = await this.repository.markProcessing(event.id);
    if (claimed === null) {
      return;
    }

    const handler = this.handlers.get(event.eventType);
    if (handler === undefined) {
      const message = `No handler registered for event type: ${event.eventType}`;
      await this.handleFailure(claimed, new Error(message));
      return;
    }

    try {
      await handler(claimed);
      await this.repository.markCompleted(claimed.id);
      this.metrics.processed += 1;
    } catch (error) {
      await this.handleFailure(claimed, error);
    }
  }

  private async handleFailure(event: OutboxEvent, error: unknown): Promise<void> {
    const message = toErrorMessage(error);
    const nextAttempt = event.attemptCount + 1;

    if (nextAttempt >= this.config.maxAttempts) {
      await this.repository.markDeadLetter(event.id, message);
      this.metrics.deadLetter += 1;
      return;
    }

    const delayMs = this.computeBackoffMs(nextAttempt);
    const nextAttemptAt = new Date(this.now().getTime() + delayMs);

    await this.repository.scheduleRetry(event.id, message, nextAttemptAt);
    this.metrics.retried += 1;
    this.metrics.failed += 1;
  }

  private computeBackoffMs(attemptCount: number): number {
    const maxBackoff = this.config.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS;
    const exponential = this.config.baseBackoffMs * 2 ** Math.max(attemptCount - 1, 0);
    return Math.min(exponential, maxBackoff);
  }
}
