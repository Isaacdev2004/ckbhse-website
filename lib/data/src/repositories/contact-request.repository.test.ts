import { describe, expect, it, beforeEach } from 'vitest';
import {
  asOrganizationId,
  asSessionId,
  asUserId,
  createUserContext,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { AuditRecorder, InMemoryAuditSink } from '@workspace/platform/audit';
import { PERMISSIONS, type Permission } from '@workspace/platform/permissions';
import { auditHooks } from '@workspace/platform/repository';
import {
  CONTACT_REQUEST_DEFINITION,
  fromCreateInput,
  type ContactRequestEntity,
} from '../mappers/contact-request.mapper.js';
import { ContactRequestRepository } from '../repositories/contact-request.repository.js';
import { InMemoryContactRequestStore } from '../stores/drizzle-contact-request.store.js';

const ORG_A = asOrganizationId('org-a');
const ORG_B = asOrganizationId('org-b');

function contextFor(
  organizationId = ORG_A,
  permissions: readonly Permission[] = [
    PERMISSIONS.ENQUIRY_READ,
    PERMISSIONS.ENQUIRY_MANAGE,
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

function enquiry(
  overrides: Partial<ContactRequestEntity> & { id: string },
): ContactRequestEntity {
  const now = new Date('2026-07-29T10:00:00.000Z');
  const organizationId = overrides.organizationId ?? ORG_A;

  return {
    ...fromCreateInput(overrides.id, organizationId, {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      serviceInterest: 'Consulting',
      message: 'This is a long enough enquiry message.',
    }, now),
    ...overrides,
  };
}

describe('ContactRequestRepository', () => {
  let store: InMemoryContactRequestStore;
  let sink: InMemoryAuditSink;
  let repository: ContactRequestRepository;

  beforeEach(() => {
    store = new InMemoryContactRequestStore();
    sink = new InMemoryAuditSink();
    repository = new ContactRequestRepository({
      store,
      hooks: auditHooks(new AuditRecorder(sink), CONTACT_REQUEST_DEFINITION),
    });
  });

  it('creates an enquiry scoped to the caller tenant', async () => {
    const created = await repository.create(contextFor(), {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      serviceInterest: 'ISO 45001',
      message: 'We would like to discuss certification support.',
    });

    expect(created.organizationId).toBe(ORG_A);
    expect(created.status).toBe('received');
    expect(sink.events).toHaveLength(1);
    expect(sink.events[0]?.action).toBe('create');
  });

  it('does not expose another tenant record by id', async () => {
    await store.insert(
      enquiry({ id: 'other-tenant', organizationId: ORG_B }),
    );

    const result = await repository.findById(contextFor(ORG_A), 'other-tenant');

    expect(result).toBeNull();
  });

  it('soft deletes and hides deleted rows from list', async () => {
    const created = await repository.create(contextFor(), {
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@example.com',
      serviceInterest: 'CDM',
      message: 'Need CDM support for a development project.',
    });

    await repository.delete(contextFor(), created.id);

    const listed = await repository.list(contextFor(), {
      page: { kind: 'offset', offset: 0, limit: 10 },
    });

    expect(listed.items).toHaveLength(0);
    expect(sink.events.some((event) => event.action === 'delete')).toBe(true);
  });

  it('transitions status when allowed', async () => {
    const created = await repository.create(contextFor(), {
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@example.com',
      serviceInterest: 'Risk assessment',
      message: 'Looking for risk assessment support please.',
    });

    const triaged = await repository.transitionStatus(
      contextFor(),
      created.id,
      'triaged',
    );

    expect(triaged.status).toBe('triaged');
  });
});
