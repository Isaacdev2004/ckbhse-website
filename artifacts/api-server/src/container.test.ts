import { describe, expect, it } from 'vitest';
import { InMemoryAuditSink } from '@workspace/platform/audit';
import { InMemoryEmailProvider } from '@workspace/platform/email';
import { InMemoryStorageProvider } from '@workspace/platform/storage';
import { InMemoryJobQueue } from '@workspace/platform/jobs';
import {
  asOrganizationId,
  asUserId,
  createUserContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { buildTenantKey } from '@workspace/platform/storage';
import { createContainer } from './container';

/**
 * Proves the composition root wires every cross-cutting dependency and that each
 * adapter actually works.
 *
 * No business code consumes the container yet — that arrives with the first
 * domain module — so without this the wiring would be unverified. Asserting the
 * behaviour here means Phase 02 inherits a foundation that is known to function
 * rather than one that merely compiles.
 */

const context = createUserContext({
  userId: asUserId('user-1'),
  organizationId: asOrganizationId('org-1'),
  permissions: [PERMISSIONS.DOCUMENT_MANAGE],
  metadata: { requestId: 'req-1', ipAddress: '203.0.113.1' },
});

describe('the composition root', () => {
  it('provides every cross-cutting dependency', () => {
    const container = createContainer();

    expect(container.loggers).toBeDefined();
    expect(container.flags).toBeDefined();
    expect(container.audit).toBeDefined();
    expect(container.email).toBeDefined();
    expect(container.storage).toBeDefined();
    expect(container.notifications).toBeDefined();
    expect(container.jobs).toBeDefined();
    expect(container.jobRegistry).toBeDefined();
  });

  it('resolves a logger per channel', () => {
    const { loggers } = createContainer();

    // Distinct instances, so a channel tag cannot leak between them.
    expect(loggers.forChannel('security')).not.toBe(loggers.forChannel('app'));
    // Cached, because channel loggers are long-lived.
    expect(loggers.forChannel('audit')).toBe(loggers.forChannel('audit'));
  });

  it('starts with no feature flags declared', () => {
    // A foundation phase has no incomplete features to hide. This assertion is
    // the reminder that the first real flag needs a removal plan.
    expect(createContainer().flags.keys).toEqual([]);
  });

  it('records audit events through the configured sink', async () => {
    const auditSink = new InMemoryAuditSink();
    const container = createContainer({ auditSink });

    await container.audit.record(context, {
      entity: 'Document',
      entityId: 'doc-1',
      action: 'create',
    });

    expect(auditSink.events).toHaveLength(1);
    expect(auditSink.events[0]).toMatchObject({
      entity: 'Document',
      actorId: 'user-1',
      organizationId: 'org-1',
      requestId: 'req-1',
    });
  });

  it('captures email rather than sending it', async () => {
    const container = createContainer();

    // The abstraction is what matters, but so does the default: an unconfigured
    // environment must not be able to email a real client.
    expect(container.email).toBeInstanceOf(InMemoryEmailProvider);

    await container.email.send({
      to: [{ email: 'client@example.com' }],
      subject: 'Report ready',
      text: 'Sign in to download it.',
    });

    expect((container.email as InMemoryEmailProvider).sent).toHaveLength(1);
  });

  it('round-trips an object through storage under a tenant key', async () => {
    const container = createContainer();
    expect(container.storage).toBeInstanceOf(InMemoryStorageProvider);

    const key = buildTenantKey('org-1', 'documents', 'report.pdf');
    const body = new TextEncoder().encode('contents');

    await container.storage.put({ key, body, contentType: 'application/pdf' });

    expect(await container.storage.get(key)).toEqual(body);
    expect(key.startsWith('org/org-1/')).toBe(true);
  });

  it('registers default notification channels', () => {
    const container = createContainer();

    expect(container.notifications.registeredChannels.sort()).toEqual([
      'email',
      'in_app',
    ]);
  });

  it('delivers email notifications through the configured provider', async () => {
    const container = createContainer();

    const results = await container.notifications.dispatch(
      context,
      {
        type: 'test.event',
        recipient: { userId: 'user-1', organizationId: 'org-1' },
        priority: 'normal',
        subject: 'Test',
        body: 'Test notification',
        data: { recipientEmail: 'client@example.com' },
      },
      ['email'],
    );

    expect(results[0]).toMatchObject({ channel: 'email', delivered: true });
    expect((container.email as InMemoryEmailProvider).sent).toHaveLength(1);
  });

  it('reports no notification delivery for unregistered channels when providers omitted', async () => {
    const container = createContainer();
    const results = await container.notifications.dispatch(
      context,
      {
        type: 'test.event',
        recipient: { userId: 'user-1', organizationId: 'org-1' },
        priority: 'normal',
        subject: 'Test',
        body: 'Test',
      },
      ['sms'],
    );

    expect(results[0]).toMatchObject({
      channel: 'sms',
      delivered: false,
      reason: 'no provider registered',
    });
  });

  it('runs a registered job end to end', async () => {
    const container = createContainer();
    const handled: string[] = [];

    container.jobRegistry.register({
      name: 'test.job',
      maxAttempts: 1,
      handle(job) {
        handled.push(job.actor.metadata.requestId);
        return Promise.resolve();
      },
    });

    await container.jobs.enqueue(context, 'test.job', { value: 1 });

    // Draining is specific to the in-memory queue, so narrow rather than cast:
    // this also pins which adapter the container is expected to supply.
    expect(container.jobs).toBeInstanceOf(InMemoryJobQueue);
    if (container.jobs instanceof InMemoryJobQueue) {
      await container.jobs.drain();
    }

    // The enqueuing request id reaches the handler, which is what makes a job's
    // logs traceable back to the request that scheduled it.
    expect(handled).toEqual(['req-1']);
  });

  it('isolates containers from each other', () => {
    const first = createContainer();
    const second = createContainer();

    first.jobRegistry.register({
      name: 'only-in-first',
      maxAttempts: 1,
      handle: () => Promise.resolve(),
    });

    // Tests must not leak registrations into one another.
    expect(second.jobRegistry.names).toEqual([]);
  });
});
