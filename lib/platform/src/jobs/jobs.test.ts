import { describe, expect, it } from 'vitest';
import {
  asOrganizationId,
  asUserId,
  createUserContext,
} from '../authorization/index.js';
import { PERMISSIONS } from '../permissions/index.js';
import { AppError } from '../errors/index.js';
import {
  InMemoryJobQueue,
  JobRegistry,
  toJobActor,
  type Job,
  type JobHandler,
} from './index.js';

const context = createUserContext({
  userId: asUserId('user-1'),
  organizationId: asOrganizationId('org-1'),
  permissions: [PERMISSIONS.PROJECT_MANAGE],
  metadata: { requestId: 'req-1', ipAddress: '203.0.113.9' },
});

function handler(
  name: string,
  behaviour: (job: Job<unknown>) => Promise<void>,
  maxAttempts = 1,
): JobHandler<unknown> {
  return { name, maxAttempts, handle: behaviour };
}

describe('JobRegistry', () => {
  it('rejects a duplicate job name', () => {
    const registry = new JobRegistry();
    registry.register(handler('email.send', () => Promise.resolve()));

    // Two handlers for one name means one silently never runs.
    expect(() =>
      registry.register(handler('email.send', () => Promise.resolve())),
    ).toThrowError(/already registered/);
  });

  it('lists registered names', () => {
    const registry = new JobRegistry();
    registry.register(handler('a', () => Promise.resolve()));
    registry.register(handler('b', () => Promise.resolve()));

    expect(registry.names).toEqual(['a', 'b']);
  });
});

describe('enqueuing', () => {
  it('rejects an unregistered job at enqueue time', async () => {
    const queue = new InMemoryJobQueue(new JobRegistry());

    // Failing here breaks the request that made the typo, rather than a worker
    // hours later with no stack trace back to the cause.
    await expect(queue.enqueue(context, 'nope', {})).rejects.toThrowError(
      /No job handler registered/,
    );
  });

  it('captures the enqueuing actor but not their permissions', async () => {
    const registry = new JobRegistry();
    registry.register(handler('report.build', () => Promise.resolve()));
    const queue = new InMemoryJobQueue(registry);

    const job = await queue.enqueue(context, 'report.build', { id: 1 });

    expect(job.actor).toEqual({
      userId: 'user-1',
      organizationId: 'org-1',
      actorKind: 'user',
      metadata: { requestId: 'req-1', ipAddress: '203.0.113.9' },
    });

    // Permissions are re-resolved at execution, so a job enqueued before a
    // revocation does not run with the old grant.
    expect('permissions' in job.actor).toBe(false);
  });

  it('does not run the job until drained', async () => {
    const registry = new JobRegistry();
    let ran = false;
    registry.register(
      handler('x', () => {
        ran = true;
        return Promise.resolve();
      }),
    );
    const queue = new InMemoryJobQueue(registry);

    await queue.enqueue(context, 'x', {});

    expect(ran).toBe(false);
    expect(queue.queued).toHaveLength(1);
  });

  it('collapses duplicates by idempotency key', async () => {
    const registry = new JobRegistry();
    registry.register(handler('x', () => Promise.resolve()));
    const queue = new InMemoryJobQueue(registry);

    await queue.enqueue(context, 'x', {}, { idempotencyKey: 'k1' });
    await queue.enqueue(context, 'x', {}, { idempotencyKey: 'k1' });

    expect(queue.queued).toHaveLength(1);
  });

  it('applies a delay to runAfter', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const registry = new JobRegistry();
    registry.register(handler('x', () => Promise.resolve()));
    const queue = new InMemoryJobQueue(registry, () => now);

    const job = await queue.enqueue(context, 'x', {}, { delaySeconds: 90 });

    expect(job.runAfter.toISOString()).toBe('2026-01-01T00:01:30.000Z');
  });
});

describe('draining', () => {
  it('runs a job and reports completion', async () => {
    const registry = new JobRegistry();
    const seen: unknown[] = [];
    registry.register(
      handler('x', (job) => {
        seen.push(job.payload);
        return Promise.resolve();
      }),
    );
    const queue = new InMemoryJobQueue(registry);

    await queue.enqueue(context, 'x', { value: 42 });
    const results = await queue.drain();

    expect(seen).toEqual([{ value: 42 }]);
    expect(results.map((result) => result.status)).toEqual(['completed']);
  });

  it('retries up to maxAttempts and passes the attempt number', async () => {
    const registry = new JobRegistry();
    const attempts: number[] = [];

    registry.register(
      handler(
        'flaky',
        (job) => {
          attempts.push(job.attempt);
          // Succeeds on the third attempt, so the handler can be seen to
          // distinguish a retry from a first run.
          return job.attempt < 3
            ? Promise.reject(new Error('transient'))
            : Promise.resolve();
        },
        3,
      ),
    );

    const queue = new InMemoryJobQueue(registry);
    await queue.enqueue(context, 'flaky', {});
    const results = await queue.drain();

    expect(attempts).toEqual([1, 2, 3]);
    expect(results.map((result) => result.status)).toEqual([
      'retrying',
      'retrying',
      'completed',
    ]);
  });

  it('reports failure once attempts are exhausted', async () => {
    const registry = new JobRegistry();
    registry.register(
      handler('always-fails', () => Promise.reject(new Error('nope')), 2),
    );

    const queue = new InMemoryJobQueue(registry);
    await queue.enqueue(context, 'always-fails', {});
    const results = await queue.drain();

    expect(results.map((result) => result.status)).toEqual([
      'retrying',
      'failed',
    ]);
    expect(results.at(-1)?.error).toBeInstanceOf(AppError);
  });

  it('does not let one failing job abandon the queue', async () => {
    const registry = new JobRegistry();
    let secondRan = false;

    registry.register(handler('bad', () => Promise.reject(new Error('x'))));
    registry.register(
      handler('good', () => {
        secondRan = true;
        return Promise.resolve();
      }),
    );

    const queue = new InMemoryJobQueue(registry);
    await queue.enqueue(context, 'bad', {});
    await queue.enqueue(context, 'good', {});
    await queue.drain();

    expect(secondRan).toBe(true);
  });
});

describe('toJobActor', () => {
  it('reduces a context to its serialisable identity', () => {
    expect(toJobActor(context).actorKind).toBe('user');
  });
});
