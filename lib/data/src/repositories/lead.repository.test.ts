import { describe, expect, it, beforeEach } from 'vitest';
import {
  asOrganizationId,
  asSessionId,
  asUserId,
  createUserContext,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { asEntityId } from '@workspace/domain/shared';
import { AuditRecorder, InMemoryAuditSink } from '@workspace/platform/audit';
import { PERMISSIONS, type Permission } from '@workspace/platform/permissions';
import { auditHooks } from '@workspace/platform/repository';
import {
  fromContactRequestInput,
  LEAD_DEFINITION,
  type LeadEntity,
} from '../mappers/lead.mapper.js';
import { LeadRepository } from '../repositories/lead.repository.js';
import { InMemoryLeadStore } from '../stores/drizzle-lead.store.js';

const ORG_A = asOrganizationId('org-a');
const ORG_B = asOrganizationId('org-b');

function contextFor(
  organizationId = ORG_A,
  permissions: readonly Permission[] = [
    PERMISSIONS.LEAD_READ,
    PERMISSIONS.LEAD_MANAGE,
  ],
): AuthorizationContext {
  return createUserContext({
    userId: asUserId(`user-of-${organizationId}`),
    organizationId,
    sessionId: asSessionId('session-1'),
    roles: ['consultant'],
    permissions,
    metadata: {
      requestId: 'req-1',
      ipAddress: '198.51.100.7',
      userAgent: 'vitest',
    },
  });
}

function lead(
  overrides: Partial<LeadEntity> & { id: string },
): LeadEntity {
  const now = new Date('2026-07-29T10:00:00.000Z');
  const organizationId = overrides.organizationId ?? ORG_A;

  return {
    ...fromContactRequestInput(
      overrides.id,
      {
        contactRequestId: asEntityId('cr-1'),
        organizationId: asOrganizationId(organizationId),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        serviceInterest: 'Consulting',
        message: 'This is a long enough enquiry message.',
      },
      now,
    ),
    ...overrides,
  };
}

describe('LeadRepository', () => {
  let store: InMemoryLeadStore;
  let sink: InMemoryAuditSink;
  let repository: LeadRepository;

  beforeEach(() => {
    store = new InMemoryLeadStore();
    sink = new InMemoryAuditSink();
    repository = new LeadRepository({
      store,
      hooks: auditHooks(new AuditRecorder(sink), LEAD_DEFINITION),
    });
  });

  it('creates a lead from a contact request scoped to the caller tenant', async () => {
    const created = await repository.createFromContact(contextFor(), {
      contactRequestId: asEntityId('cr-100'),
      organizationId: ORG_A,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      serviceInterest: 'ISO 45001',
      message: 'We would like to discuss certification support.',
    });

    expect(created.organizationId).toBe(ORG_A);
    expect(created.status).toBe('new');
    expect(created.contactRequestId).toBe('cr-100');
    expect(sink.events).toHaveLength(1);
    expect(sink.events[0]?.action).toBe('create');
  });

  it('does not expose another tenant record by id', async () => {
    await store.insert(lead({ id: 'other-tenant', organizationId: ORG_B }));

    const result = await repository.findById(contextFor(ORG_A), 'other-tenant');

    expect(result).toBeNull();
  });

  it('searches within tenant boundaries', async () => {
    await store.insert(
      lead({
        id: 'lead-a',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        company: 'Engines Ltd',
      }),
    );
    await store.insert(
      lead({
        id: 'lead-b',
        organizationId: ORG_B,
        firstName: 'Ada',
        lastName: 'Other',
        email: 'ada@other.com',
      }),
    );

    const results = await repository.search(
      contextFor(ORG_A),
      { keyword: 'ada' },
      { kind: 'offset', offset: 0, limit: 10 },
    );

    expect(results.items).toHaveLength(1);
    expect(results.items[0]?.id).toBe('lead-a');
  });

  it('transitions status when allowed', async () => {
    const created = await repository.createFromContact(contextFor(), {
      contactRequestId: asEntityId('cr-200'),
      organizationId: ORG_A,
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@example.com',
      serviceInterest: 'Risk assessment',
      message: 'Looking for risk assessment support please.',
    });

    const acknowledged = await repository.transitionStatus(
      contextFor(),
      created.id,
      'acknowledged',
    );

    expect(acknowledged.status).toBe('acknowledged');
  });
});
