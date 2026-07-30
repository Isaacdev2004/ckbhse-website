import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OutboxEvent } from '@workspace/domain/outbox';
import { OUTBOX_EVENT_CONTACT_REQUEST_CREATED } from '@workspace/domain/notifications';
import { OutboxWorker } from './outbox-worker.js';

function event(overrides: Partial<OutboxEvent> = {}): OutboxEvent {
  return {
    id: 'evt-1',
    aggregateType: 'ContactRequest',
    aggregateId: 'cr-1',
    eventType: OUTBOX_EVENT_CONTACT_REQUEST_CREATED,
    payload: { contactRequestId: 'cr-1', email: 'a@example.com', serviceInterest: 'audit' },
    status: 'pending',
    idempotencyKey: null,
    organizationId: 'org-1',
    createdAt: new Date('2026-07-29T10:00:00.000Z'),
    processedAt: null,
    attemptCount: 0,
    lastError: null,
    nextAttemptAt: null,
    ...overrides,
  };
}

function createRepositoryMock(initialEvents: OutboxEvent[] = [event()]) {
  const store = new Map(initialEvents.map((item) => [item.id, { ...item }]));

  return {
    listPending: vi.fn(async (limit?: number) => {
      const pending = [...store.values()].filter((item) => item.status === 'pending');
      return pending.slice(0, limit ?? 50);
    }),
    markProcessing: vi.fn(async (id: string) => {
      const current = store.get(id);
      if (current === undefined || current.status !== 'pending') {
        return null;
      }
      const updated = { ...current, status: 'processing' as const };
      store.set(id, updated);
      return updated;
    }),
    markCompleted: vi.fn(async (id: string) => {
      const current = store.get(id);
      if (current === undefined) return null;
      const updated = {
        ...current,
        status: 'completed' as const,
        processedAt: new Date('2026-07-29T10:01:00.000Z'),
      };
      store.set(id, updated);
      return updated;
    }),
    markFailed: vi.fn(),
    scheduleRetry: vi.fn(async (id: string, error: string, nextAttemptAt: Date) => {
      const current = store.get(id);
      if (current === undefined) return null;
      const updated = {
        ...current,
        status: 'pending' as const,
        lastError: error,
        attemptCount: current.attemptCount + 1,
        nextAttemptAt,
      };
      store.set(id, updated);
      return updated;
    }),
    markDeadLetter: vi.fn(async (id: string, error: string) => {
      const current = store.get(id);
      if (current === undefined) return null;
      const updated = {
        ...current,
        status: 'dead_letter' as const,
        lastError: error,
        attemptCount: current.attemptCount + 1,
      };
      store.set(id, updated);
      return updated;
    }),
    store,
  };
}

describe('OutboxWorker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('processes pending events and invokes the registered handler', async () => {
    const handler = vi.fn(async () => undefined);
    const repository = createRepositoryMock();
    const worker = new OutboxWorker({
      repository: repository as never,
      handlers: new Map([[OUTBOX_EVENT_CONTACT_REQUEST_CREATED, handler]]),
      config: {
        pollingIntervalMs: 1_000,
        batchSize: 10,
        maxAttempts: 3,
        baseBackoffMs: 1_000,
      },
    });

    await worker.processBatch();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(repository.markProcessing).toHaveBeenCalledWith('evt-1');
    expect(repository.markCompleted).toHaveBeenCalledWith('evt-1');
    expect(worker.metrics.processed).toBe(1);
  });

  it('schedules a retry with exponential backoff when the handler fails', async () => {
    const handler = vi.fn(async () => {
      throw new Error('smtp unavailable');
    });
    const repository = createRepositoryMock();
    const now = new Date('2026-07-29T10:00:00.000Z');
    const worker = new OutboxWorker({
      repository: repository as never,
      handlers: new Map([[OUTBOX_EVENT_CONTACT_REQUEST_CREATED, handler]]),
      config: {
        pollingIntervalMs: 1_000,
        batchSize: 10,
        maxAttempts: 3,
        baseBackoffMs: 2_000,
      },
      now: () => now,
    });

    await worker.processBatch();

    expect(repository.scheduleRetry).toHaveBeenCalledWith(
      'evt-1',
      'smtp unavailable',
      new Date(now.getTime() + 2_000),
    );
    expect(worker.metrics.retried).toBe(1);
    expect(worker.metrics.failed).toBe(1);
    expect(worker.metrics.deadLetter).toBe(0);
  });

  it('moves events to dead letter after max attempts', async () => {
    const handler = vi.fn(async () => {
      throw new Error('permanent failure');
    });
    const repository = createRepositoryMock([
      event({ attemptCount: 2 }),
    ]);
    const worker = new OutboxWorker({
      repository: repository as never,
      handlers: new Map([[OUTBOX_EVENT_CONTACT_REQUEST_CREATED, handler]]),
      config: {
        pollingIntervalMs: 1_000,
        batchSize: 10,
        maxAttempts: 3,
        baseBackoffMs: 1_000,
      },
    });

    await worker.processBatch();

    expect(repository.markDeadLetter).toHaveBeenCalledWith(
      'evt-1',
      'permanent failure',
    );
    expect(worker.metrics.deadLetter).toBe(1);
    expect(repository.scheduleRetry).not.toHaveBeenCalled();
  });

  it('dead-letters events with no registered handler', async () => {
    const repository = createRepositoryMock([
      event({ eventType: 'notification.unknown' }),
    ]);
    const worker = new OutboxWorker({
      repository: repository as never,
      handlers: new Map(),
      config: {
        pollingIntervalMs: 1_000,
        batchSize: 10,
        maxAttempts: 1,
        baseBackoffMs: 1_000,
      },
    });

    await worker.processBatch();

    expect(repository.markDeadLetter).toHaveBeenCalledWith(
      'evt-1',
      expect.stringContaining('No handler registered'),
    );
  });

  it('stops accepting new batches and finishes the in-flight batch on shutdown', async () => {
    let resolveHandler: (() => void) | undefined;
    const handler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveHandler = resolve;
        }),
    );
    const repository = createRepositoryMock();
    const worker = new OutboxWorker({
      repository: repository as never,
      handlers: new Map([[OUTBOX_EVENT_CONTACT_REQUEST_CREATED, handler]]),
      config: {
        pollingIntervalMs: 50,
        batchSize: 10,
        maxAttempts: 3,
        baseBackoffMs: 1_000,
      },
    });

    worker.start();
    await vi.advanceTimersByTimeAsync(0);

    const stopPromise = worker.stop();
    worker.start();

    resolveHandler?.();
    await stopPromise;

    expect(handler).toHaveBeenCalledTimes(1);
    expect(repository.markCompleted).toHaveBeenCalledTimes(1);
  });
});
