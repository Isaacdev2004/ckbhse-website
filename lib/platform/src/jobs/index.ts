/**
 * Background job abstraction.
 *
 * Prepares the infrastructure for email delivery, report generation,
 * notification fan-out and certificate generation without defining any of them.
 *
 * Two decisions are worth stating, because they are the ones that are painful to
 * reverse later:
 *
 *  1. A job payload carries the *enqueuing* authorization context, and the worker
 *     reconstitutes it. A job that ran with ambient privileges would be a way to
 *     launder a permission check through a queue.
 *  2. Handlers must be idempotent, because at-least-once delivery is the only
 *     guarantee any real queue offers. `attempt` is passed to the handler so it
 *     can tell a retry from a first run.
 *
 * No concrete jobs and no queue backend in this phase.
 */

import { AppError } from '../errors/index.js';
import { toAppError } from '../errors/index.js';
import type {
  AuthorizationContext,
  RequestMetadata,
} from '../authorization/index.js';

/**
 * The portion of the authorization context that survives serialisation.
 *
 * Permissions are deliberately *not* stored: they are re-resolved when the job
 * runs, so a job enqueued before a permission was revoked does not execute with
 * the old grant.
 */
export interface JobActor {
  readonly userId: string | null;
  readonly organizationId: string | null;
  readonly actorKind: AuthorizationContext['actorKind'];
  readonly metadata: RequestMetadata;
}

export function toJobActor(context: AuthorizationContext): JobActor {
  return {
    userId: context.userId ?? null,
    organizationId: context.organizationId ?? null,
    actorKind: context.actorKind,
    metadata: context.metadata,
  };
}

export interface Job<TPayload = unknown> {
  readonly id: string;
  readonly name: string;
  readonly payload: TPayload;
  readonly actor: JobActor;
  /** 1 on the first run. Lets a handler distinguish a retry. */
  readonly attempt: number;
  readonly enqueuedAt: Date;
  /** Earliest execution time, for delays and backoff. */
  readonly runAfter: Date;
}

export interface JobHandler<TPayload = unknown> {
  readonly name: string;
  /** Total attempts before the job is treated as failed. */
  readonly maxAttempts: number;
  handle(job: Job<TPayload>): Promise<void>;
}

export interface EnqueueOptions {
  readonly delaySeconds?: number;
  /**
   * Collapses duplicate enqueues. Required for anything triggered by a webhook or
   * a retryable request, where the same event legitimately arrives twice.
   */
  readonly idempotencyKey?: string;
}

export interface JobQueue {
  readonly name: string;
  enqueue<TPayload>(
    context: AuthorizationContext,
    name: string,
    payload: TPayload,
    options?: EnqueueOptions,
  ): Promise<Job<TPayload>>;
}

/**
 * Handlers by name, with registration-time collision detection.
 *
 * Two handlers claiming the same job name is a silent, severe fault: one of them
 * simply never runs, and nothing reports it.
 */
export class JobRegistry {
  private readonly handlers = new Map<string, JobHandler<never>>();

  register<TPayload>(handler: JobHandler<TPayload>): void {
    if (this.handlers.has(handler.name)) {
      throw AppError.internal(
        `A job handler is already registered for: ${handler.name}`,
      );
    }
    this.handlers.set(handler.name, handler as JobHandler<never>);
  }

  get(name: string): JobHandler<never> | undefined {
    return this.handlers.get(name);
  }

  get names(): readonly string[] {
    return [...this.handlers.keys()];
  }
}

export interface JobResult {
  readonly job: Job<unknown>;
  readonly status: 'completed' | 'retrying' | 'failed';
  readonly error?: AppError;
}

/**
 * A synchronous, in-process queue for tests and local development.
 *
 * Jobs are held until `drain()` is called, so a test can enqueue, assert nothing
 * has happened yet, then run the queue deterministically — which is what makes
 * job behaviour testable without a broker. Retries are applied without waiting,
 * so backoff is exercised as logic rather than as elapsed time.
 *
 * Not for production: no persistence, so a restart loses the queue.
 */
export class InMemoryJobQueue implements JobQueue {
  readonly name = 'in-memory';

  private readonly pending: Job<unknown>[] = [];
  private readonly seenKeys = new Set<string>();
  private counter = 0;

  constructor(
    private readonly registry: JobRegistry,
    private readonly now: () => Date = () => new Date(),
  ) {}

  // `async` so an unregistered job name rejects rather than throwing
  // synchronously from a method typed `Promise<Job>`.
  async enqueue<TPayload>(
    context: AuthorizationContext,
    name: string,
    payload: TPayload,
    options: EnqueueOptions = {},
  ): Promise<Job<TPayload>> {
    if (this.registry.get(name) === undefined) {
      // Fail at enqueue rather than at drain: a typo in a job name should break
      // the request that caused it, not a worker hours later.
      throw AppError.internal(`No job handler registered for: ${name}`);
    }

    const enqueuedAt = this.now();
    this.counter += 1;

    const job: Job<TPayload> = {
      id: `job-${this.counter}`,
      name,
      payload,
      actor: toJobActor(context),
      attempt: 1,
      enqueuedAt,
      runAfter: new Date(
        enqueuedAt.getTime() + (options.delaySeconds ?? 0) * 1000,
      ),
    };

    if (options.idempotencyKey !== undefined) {
      if (this.seenKeys.has(options.idempotencyKey)) {
        return job;
      }
      this.seenKeys.add(options.idempotencyKey);
    }

    this.pending.push(job as Job<unknown>);
    return job;
  }

  get queued(): readonly Job<unknown>[] {
    return this.pending;
  }

  /**
   * Run every queued job to completion or exhaustion, returning one result per
   * terminal outcome so tests can assert on retries as well as successes.
   */
  async drain(): Promise<readonly JobResult[]> {
    const results: JobResult[] = [];

    while (this.pending.length > 0) {
      const job = this.pending.shift();
      if (job === undefined) break;

      const handler = this.registry.get(job.name);
      if (handler === undefined) {
        results.push({
          job,
          status: 'failed',
          error: AppError.internal(
            `No job handler registered for: ${job.name}`,
          ),
        });
        continue;
      }

      try {
        await handler.handle(job as Job<never>);
        results.push({ job, status: 'completed' });
      } catch (caught) {
        const error = toAppError(caught);

        if (job.attempt < handler.maxAttempts) {
          this.pending.push({ ...job, attempt: job.attempt + 1 });
          results.push({ job, status: 'retrying', error });
        } else {
          results.push({ job, status: 'failed', error });
        }
      }
    }

    return results;
  }

  clear(): void {
    this.pending.length = 0;
    this.seenKeys.clear();
    this.counter = 0;
  }
}
