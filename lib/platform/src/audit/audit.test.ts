import { describe, expect, it } from 'vitest';
import {
  asOrganizationId,
  asSessionId,
  asUserId,
  createSystemContext,
  createUserContext,
} from '../authorization/index.js';
import { PERMISSIONS } from '../permissions/index.js';
import {
  AuditRecorder,
  InMemoryAuditSink,
  REDACTED_PLACEHOLDER,
  diffAuditValues,
  redactAuditValues,
} from './index.js';

const context = createUserContext({
  userId: asUserId('user-1'),
  organizationId: asOrganizationId('org-1'),
  sessionId: asSessionId('session-1'),
  roles: ['consultant'],
  permissions: [PERMISSIONS.AUDIT_CONDUCT],
  metadata: {
    requestId: 'req-1',
    ipAddress: '198.51.100.2',
    userAgent: 'Mozilla/5.0',
  },
});

describe('redactAuditValues', () => {
  it('replaces sensitive values but keeps the key', () => {
    const redacted = redactAuditValues({
      email: 'person@example.com',
      passwordHash: '$2b$12$abcdef',
      mfaSecret: 'JBSWY3DPEHPK3PXP',
    });

    // Keeping the key preserves the fact that the field changed, which is the
    // part an investigation needs, without disclosing the new value.
    expect(redacted).toEqual({
      email: 'person@example.com',
      passwordHash: REDACTED_PLACEHOLDER,
      mfaSecret: REDACTED_PLACEHOLDER,
    });
  });

  it('matches key names case-insensitively', () => {
    expect(redactAuditValues({ PASSWORD: 'x', Token: 'y' })).toEqual({
      PASSWORD: REDACTED_PLACEHOLDER,
      Token: REDACTED_PLACEHOLDER,
    });
  });

  it('returns null for absent values', () => {
    expect(redactAuditValues(null)).toBeNull();
    expect(redactAuditValues(undefined)).toBeNull();
  });
});

describe('diffAuditValues', () => {
  it('records only changed fields', () => {
    const diff = diffAuditValues(
      { title: 'Before', severity: 2, owner: 'ana' },
      { title: 'After', severity: 2, owner: 'ana' },
    );

    // Storing whole rows makes the log expensive and its diffs unreadable.
    expect(diff.previousValues).toEqual({ title: 'Before' });
    expect(diff.newValues).toEqual({ title: 'After' });
  });

  it('reports no diff when nothing changed', () => {
    const diff = diffAuditValues({ title: 'Same' }, { title: 'Same' });

    expect(diff.previousValues).toBeNull();
    expect(diff.newValues).toBeNull();
  });

  it('treats an added field as a change', () => {
    const diff = diffAuditValues({}, { note: 'added' });

    expect(diff.newValues).toEqual({ note: 'added' });
  });

  it('redacts within the diff', () => {
    const diff = diffAuditValues(
      { token: 'old-token' },
      { token: 'new-token' },
    );

    expect(diff.previousValues).toEqual({ token: REDACTED_PLACEHOLDER });
    expect(diff.newValues).toEqual({ token: REDACTED_PLACEHOLDER });
  });

  it('passes through creates and deletes unchanged', () => {
    expect(diffAuditValues(null, { title: 'New' })).toEqual({
      previousValues: null,
      newValues: { title: 'New' },
    });

    expect(diffAuditValues({ title: 'Gone' }, null)).toEqual({
      previousValues: { title: 'Gone' },
      newValues: null,
    });
  });
});

describe('AuditRecorder', () => {
  it('populates every required field from the context', () => {
    const sink = new InMemoryAuditSink();
    const occurredAt = new Date('2026-03-01T09:30:00.000Z');
    const recorder = new AuditRecorder(sink, () => occurredAt);

    const event = recorder.build(context, {
      entity: 'Project',
      entityId: 'proj-1',
      action: 'update',
    });

    expect(event).toEqual({
      entity: 'Project',
      entityId: 'proj-1',
      action: 'update',
      actorId: 'user-1',
      actorKind: 'user',
      organizationId: 'org-1',
      sessionId: 'session-1',
      requestId: 'req-1',
      occurredAt,
      ipAddress: '198.51.100.2',
      userAgent: 'Mozilla/5.0',
      previousValues: null,
      newValues: null,
      metadata: null,
    });
  });

  it('records a system actor without a user or tenant', async () => {
    const sink = new InMemoryAuditSink();
    const recorder = new AuditRecorder(sink);

    await recorder.record(
      createSystemContext({ requestId: 'job-7' }, 'expiry sweep'),
      { entity: 'Certificate', entityId: 'cert-1', action: 'export' },
    );

    // Greppable as a system action rather than appearing to be nobody.
    expect(sink.events[0]).toMatchObject({
      actorKind: 'system',
      actorId: null,
      organizationId: null,
      requestId: 'job-7',
    });
  });

  it('redacts values passed to it', async () => {
    const sink = new InMemoryAuditSink();
    await new AuditRecorder(sink).record(context, {
      entity: 'User',
      entityId: 'user-2',
      action: 'update',
      newValues: { password: 'plaintext' },
    });

    expect(sink.events[0]?.newValues).toEqual({
      password: REDACTED_PLACEHOLDER,
    });
  });
});

describe('InMemoryAuditSink', () => {
  it('filters by entity and id', async () => {
    const sink = new InMemoryAuditSink();
    const recorder = new AuditRecorder(sink);

    await recorder.record(context, {
      entity: 'Project',
      entityId: 'p1',
      action: 'create',
    });
    await recorder.record(context, {
      entity: 'Project',
      entityId: 'p2',
      action: 'create',
    });
    await recorder.record(context, {
      entity: 'Invoice',
      entityId: 'i1',
      action: 'create',
    });

    expect(sink.eventsFor('Project')).toHaveLength(2);
    expect(sink.eventsFor('Project', 'p1')).toHaveLength(1);
    expect(sink.eventsFor('Invoice')).toHaveLength(1);
  });

  it('exposes no way to amend a recorded event', () => {
    const sink = new InMemoryAuditSink();

    // The audit log is append-only by contract. If a mutator ever appears on the
    // sink interface, this assertion is the tripwire.
    expect(Object.keys(sink)).not.toContain('update');
    expect('update' in sink).toBe(false);
    expect('delete' in sink).toBe(false);
  });
});
