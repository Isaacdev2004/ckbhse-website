import { describe, expect, it } from 'vitest';
import {
  fromCreateInput,
  toContactRequestEntity,
  toContactRequestRow,
  toDomainContactRequest,
} from './contact-request.mapper.js';

describe('contact-request.mapper', () => {
  const now = new Date('2026-07-29T10:00:00.000Z');

  const row = {
    id: 'cr-1',
    organizationId: 'org-1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ADA@example.com',
    phone: '+441234567890',
    company: 'Analytical Engines Ltd',
    serviceInterest: 'ISO 45001',
    message: 'We need help certifying our manufacturing sites.',
    status: 'received' as const,
    source: 'website' as const,
    ipAddress: '198.51.100.7',
    userAgent: 'vitest',
    assignedToUserId: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
    createdBy: null,
    updatedBy: null,
  };

  it('maps a database row to a platform entity', () => {
    const entity = toContactRequestEntity(row);

    expect(entity.id).toBe('cr-1');
    expect(entity.organizationId).toBe('org-1');
    expect(entity.email).toBe('ADA@example.com');
    expect(entity.deletedAt).toBeNull();
  });

  it('round-trips through the insert row shape', () => {
    const entity = toContactRequestEntity(row);
    const roundTrip = toContactRequestEntity(toContactRequestRow(entity));

    expect(roundTrip).toEqual(entity);
  });

  it('maps create input with normalised email', () => {
    const entity = fromCreateInput(
      'cr-2',
      'org-1',
      {
        firstName: ' Grace ',
        lastName: ' Hopper ',
        email: ' Grace@Example.COM ',
        serviceInterest: 'CDM',
        message: 'Need CDM support for a London development.',
        source: 'portal',
      },
      now,
    );

    expect(entity.email).toBe('grace@example.com');
    expect(entity.firstName).toBe('Grace');
    expect(entity.status).toBe('received');
  });

  it('maps to the domain contact request without tenant metadata', () => {
    const entity = toContactRequestEntity(row);
    const domain = toDomainContactRequest(entity);

    expect(domain.id).toBe(entity.id);
    expect(domain).not.toHaveProperty('organizationId');
    expect(domain.version).toBe(1);
  });

  it('rejects rows without an organisation id', () => {
    expect(() =>
      toContactRequestEntity({ ...row, organizationId: null }),
    ).toThrow(/organizationId/);
  });
});
