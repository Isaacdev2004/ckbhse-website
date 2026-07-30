import { describe, expect, it } from 'vitest';
import { asEntityId, asOrganizationId } from '@workspace/domain/shared';
import {
  fromContactRequestInput,
  toDomainLead,
  toLeadEntity,
  toLeadRow,
} from './lead.mapper.js';

describe('lead.mapper', () => {
  const now = new Date('2026-07-29T10:00:00.000Z');

  const row = {
    id: 'lead-1',
    organizationId: 'org-1',
    contactRequestId: 'cr-1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ADA@example.com',
    phone: '+441234567890',
    company: 'Analytical Engines Ltd',
    serviceInterest: 'ISO 45001',
    industry: 'Manufacturing',
    trainingInterest: 'NEBOSH',
    message: 'We need help certifying our manufacturing sites.',
    status: 'new' as const,
    priority: 'normal' as const,
    source: 'website' as const,
    assignedToUserId: null,
    score: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
    createdBy: null,
    updatedBy: null,
  };

  it('maps a database row to a platform entity', () => {
    const entity = toLeadEntity(row);

    expect(entity.id).toBe('lead-1');
    expect(entity.organizationId).toBe('org-1');
    expect(entity.email).toBe('ADA@example.com');
    expect(entity.contactRequestId).toBe('cr-1');
    expect(entity.deletedAt).toBeNull();
  });

  it('round-trips through the insert row shape', () => {
    const entity = toLeadEntity(row);
    const roundTrip = toLeadEntity(toLeadRow(entity));

    expect(roundTrip).toEqual(entity);
  });

  it('maps contact request input with normalised email', () => {
    const entity = fromContactRequestInput(
      'lead-2',
      {
        contactRequestId: asEntityId('cr-2'),
        organizationId: asOrganizationId('org-1'),
        firstName: ' Grace ',
        lastName: ' Hopper ',
        email: ' Grace@Example.COM ',
        serviceInterest: 'CDM',
        message: 'Need CDM support for a London development.',
        source: 'referral',
      },
      now,
    );

    expect(entity.email).toBe('grace@example.com');
    expect(entity.firstName).toBe('Grace');
    expect(entity.status).toBe('new');
    expect(entity.contactRequestId).toBe('cr-2');
  });

  it('maps to the domain lead', () => {
    const entity = toLeadEntity(row);
    const domain = toDomainLead(entity);

    expect(domain.id).toBe(entity.id);
    expect(domain.organizationId).toBe(entity.organizationId);
    expect(domain.version).toBe(1);
  });

  it('rejects rows without an organisation id', () => {
    expect(() =>
      toLeadEntity({ ...row, organizationId: null as unknown as string }),
    ).toThrow(/organizationId/);
  });
});
