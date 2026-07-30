import { DatabaseAuditSink } from '@workspace/data/audit';
import { toDomainContactRequest } from '@workspace/data/mappers/contact-request';
import { OutboxWriter } from '@workspace/data/outbox';
import {
  createContactRequestRepository,
  type ContactRequestRepository,
} from '@workspace/data/repositories/contact-request';
import {
  TransactionManager,
  type TransactionClient,
} from '@workspace/data/transaction';
import { DrizzleContactRequestStore } from '@workspace/data/stores/contact-request';
import type {
  ContactRequest,
  CreateContactRequestInput,
} from '@workspace/domain/crm';
import { validateContactRequestInput } from '@workspace/domain/crm';
import { OUTBOX_EVENT_CONTACT_REQUEST_CREATED } from '@workspace/domain/notifications';
import {
  createSystemContext,
  type RequestMetadata,
} from '@workspace/platform/authorization';
import { AuditRecorder } from '@workspace/platform/audit';
import { AppError } from '@workspace/platform/errors';

/** Request metadata plus the public enquiry payload. */
export interface SubmitPublicEnquiryInput extends CreateContactRequestInput {
  readonly metadata: RequestMetadata;
}

export interface ContactRequestServiceDeps {
  readonly transactionManager: TransactionManager;
  readonly outboxWriter: OutboxWriter;
  readonly platformOrganizationId: string;
  readonly systemReason?: string;
  readonly createRepository?: (
    tx: TransactionClient,
  ) => ContactRequestRepository;
  readonly createAuditRecorder?: (tx: TransactionClient) => AuditRecorder;
}

/**
 * Application service for CRM contact enquiries.
 *
 * Public submissions are accepted without a user session. The service acts under
 * a system authorization context and commits the enquiry, audit row, and outbox
 * event atomically.
 */
export class ContactRequestService {
  private readonly transactionManager: TransactionManager;
  private readonly outboxWriter: OutboxWriter;
  private readonly platformOrganizationId: string;
  private readonly systemReason: string;
  private readonly createRepository: (
    tx: TransactionClient,
  ) => ContactRequestRepository;
  private readonly createAuditRecorder: (
    tx: TransactionClient,
  ) => AuditRecorder;

  constructor(deps: ContactRequestServiceDeps) {
    this.transactionManager = deps.transactionManager;
    this.outboxWriter = deps.outboxWriter;
    this.platformOrganizationId = deps.platformOrganizationId;
    this.systemReason =
      deps.systemReason ?? 'public contact enquiry submission';
    this.createRepository =
      deps.createRepository ??
      ((tx) =>
        createContactRequestRepository({
          store: new DrizzleContactRequestStore(tx),
        }));
    this.createAuditRecorder =
      deps.createAuditRecorder ??
      ((tx) => new AuditRecorder(new DatabaseAuditSink(tx)));
  }

  /**
   * Accept a contact form submission from the public website.
   *
   * Validates domain rules, persists the enquiry for the platform operator
   * organisation, records an audit event, and enqueues a notification outbox
   * message — all within one transaction.
   */
  async submitPublicEnquiry(
    input: SubmitPublicEnquiryInput,
  ): Promise<ContactRequest> {
    try {
      validateContactRequestInput(input);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid enquiry payload';
      throw AppError.unprocessable(message);
    }

    const context = createSystemContext(input.metadata, this.systemReason);

    const entity = await this.transactionManager.run(async (tx) => {
      const repository = this.createRepository(tx);
      const auditRecorder = this.createAuditRecorder(tx);

      const created = await repository.createPublicEnquiry(
        context,
        this.platformOrganizationId,
        input,
      );

      await auditRecorder.record(context, {
        entity: 'ContactRequest',
        entityId: created.id,
        action: 'create',
        newValues: {
          email: created.email,
          serviceInterest: created.serviceInterest,
          source: created.source,
          status: created.status,
        },
      });

      await this.outboxWriter.write(tx, {
        aggregateType: 'ContactRequest',
        aggregateId: created.id,
        eventType: OUTBOX_EVENT_CONTACT_REQUEST_CREATED,
        payload: {
          contactRequestId: created.id,
          email: created.email,
          serviceInterest: created.serviceInterest,
        },
        organizationId: this.platformOrganizationId,
      });

      return created;
    });

    return toDomainContactRequest(entity);
  }
}
