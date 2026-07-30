import { describe, expect, it, vi } from 'vitest';
import type { ContactRequestEntity } from '@workspace/data/mappers/contact-request';
import type { ContactRequestRepository } from '@workspace/data/repositories/contact-request';
import {
  TransactionManager,
  type TransactionClient,
} from '@workspace/data/transaction';
import { OUTBOX_EVENT_CONTACT_REQUEST_CREATED } from '@workspace/domain/notifications';
import type { CreateContactRequestInput } from '@workspace/domain/crm';
import { AppError } from '@workspace/platform/errors';
import { AuditRecorder, InMemoryAuditSink } from '@workspace/platform/audit';

import {
  ContactRequestService,
  type SubmitPublicEnquiryInput,
} from './contact-request.service.js';

function buildEntity(
  overrides: Partial<ContactRequestEntity> = {},
): ContactRequestEntity {
  const now = new Date('2026-07-29T10:00:00.000Z');

  return {
    id: 'cr-001',
    organizationId: 'org-platform',
    firstName: 'Alex',
    lastName: 'Taylor',
    email: 'alex@example.com',
    phone: null,
    company: 'Example Ltd',
    serviceInterest: 'ISO 45001 consultancy',
    message: 'We would like to discuss certification support.',
    status: 'received',
    source: 'website',
    ipAddress: '203.0.113.10',
    userAgent: 'vitest',
    assignedToUserId: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
    createdBy: null,
    updatedBy: null,
    ...overrides,
  };
}

describe('ContactRequestService.submitPublicEnquiry', () => {
  it('creates an enquiry, audit row, and outbox event in one transaction', async () => {
    const outboxWrites: unknown[] = [];

    const repository: Pick<
      ContactRequestRepository,
      'createPublicEnquiry'
    > = {
      createPublicEnquiry: vi.fn(async (_context, organizationId, input) =>
        buildEntity({
          organizationId,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: input.email.trim().toLowerCase(),
          serviceInterest: input.serviceInterest.trim(),
          message: input.message.trim(),
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        }),
      ),
    };

    const service = new ContactRequestService({
      transactionManager: {
        run: (fn: (tx: TransactionClient) => Promise<ContactRequestEntity>) =>
          fn({} as TransactionClient),
      } as unknown as TransactionManager,
      outboxWriter: {
        write: vi.fn(async (_tx, input) => {
          outboxWrites.push(input);
          return {
            id: 'outbox-1',
            aggregateType: input.aggregateType,
            aggregateId: input.aggregateId,
            eventType: input.eventType,
            payload: input.payload,
            status: 'pending' as const,
            idempotencyKey: null,
            organizationId: input.organizationId ?? null,
            createdAt: new Date(),
            processedAt: null,
            attemptCount: 0,
            lastError: null,
            nextAttemptAt: null,
          };
        }),
      },
      platformOrganizationId: 'org-platform',
      createRepository: () => repository as ContactRequestRepository,
      createAuditRecorder: () => new AuditRecorder(new InMemoryAuditSink()),
    });

    const input: SubmitPublicEnquiryInput = {
      firstName: 'Alex',
      lastName: 'Taylor',
      email: 'Alex@Example.com',
      serviceInterest: 'ISO 45001 consultancy',
      message: 'We would like to discuss certification support.',
      ipAddress: '203.0.113.10',
      userAgent: 'vitest',
      metadata: {
        requestId: 'req-001',
        ipAddress: '203.0.113.10',
        userAgent: 'vitest',
      },
    };

    const result = await service.submitPublicEnquiry(input);

    expect(result.email).toBe('alex@example.com');
    expect(repository.createPublicEnquiry).toHaveBeenCalledOnce();
    expect(outboxWrites).toHaveLength(1);
    expect(outboxWrites[0]).toMatchObject({
      aggregateType: 'ContactRequest',
      aggregateId: 'cr-001',
      eventType: OUTBOX_EVENT_CONTACT_REQUEST_CREATED,
      organizationId: 'org-platform',
    });
  });

  it('rejects invalid payloads with an unprocessable entity error', async () => {
    const service = new ContactRequestService({
      transactionManager: {
        run: (fn: (tx: TransactionClient) => Promise<unknown>) =>
          fn({} as TransactionClient),
      } as unknown as TransactionManager,
      outboxWriter: { write: vi.fn() },
      platformOrganizationId: 'org-platform',
      createRepository: () =>
        ({
          createPublicEnquiry: vi.fn(),
        }) as unknown as ContactRequestRepository,
    });

    await expect(
      service.submitPublicEnquiry({
        firstName: 'Alex',
        lastName: 'Taylor',
        email: 'not-an-email',
        serviceInterest: 'Consulting',
        message: 'Too short',
        metadata: { requestId: 'req-002' },
      } satisfies CreateContactRequestInput & {
        metadata: SubmitPublicEnquiryInput['metadata'];
      }),
    ).rejects.toMatchObject({
      code: 'unprocessable_entity',
    } satisfies Partial<AppError>);
  });

  it('requires a system context at the repository boundary', async () => {
    const service = new ContactRequestService({
      transactionManager: {
        run: (fn: (tx: TransactionClient) => Promise<unknown>) =>
          fn({} as TransactionClient),
      } as unknown as TransactionManager,
      outboxWriter: { write: vi.fn() },
      platformOrganizationId: 'org-platform',
      createRepository: () =>
        ({
          createPublicEnquiry: vi.fn(async () => {
            throw AppError.forbidden(
              'Public enquiry submission requires a system authorization context',
            );
          }),
        }) as unknown as ContactRequestRepository,
    });

    await expect(
      service.submitPublicEnquiry({
        firstName: 'Alex',
        lastName: 'Taylor',
        email: 'alex@example.com',
        serviceInterest: 'Consulting',
        message: 'Valid message with enough length.',
        metadata: { requestId: 'req-003' },
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });
  });
});
