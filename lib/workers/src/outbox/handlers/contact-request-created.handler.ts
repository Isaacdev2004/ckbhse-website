import type { OutboxEvent } from '@workspace/domain/outbox';
import { OUTBOX_EVENT_CONTACT_REQUEST_CREATED } from '@workspace/domain/notifications';

/**
 * Handles lead and notification side effects when a public contact enquiry is
 * persisted. Implemented in lib/services; injected here to keep the worker
 * free of orchestration details.
 */
export interface LeadService {
  handleContactRequestCreated(input: {
    readonly contactRequestId: string;
    readonly email: string;
    readonly serviceInterest: string;
    readonly organizationId: string | null;
  }): Promise<void>;
}

export interface ContactRequestCreatedHandlerDeps {
  readonly leadService: LeadService;
}

interface ContactRequestCreatedPayload {
  readonly contactRequestId: string;
  readonly email: string;
  readonly serviceInterest: string;
}

function parsePayload(
  payload: Readonly<Record<string, unknown>>,
): ContactRequestCreatedPayload {
  const contactRequestId = payload.contactRequestId;
  const email = payload.email;
  const serviceInterest = payload.serviceInterest;

  if (typeof contactRequestId !== 'string' || contactRequestId.trim() === '') {
    throw new Error('Outbox payload missing contactRequestId');
  }
  if (typeof email !== 'string' || email.trim() === '') {
    throw new Error('Outbox payload missing email');
  }
  if (typeof serviceInterest !== 'string' || serviceInterest.trim() === '') {
    throw new Error('Outbox payload missing serviceInterest');
  }

  return { contactRequestId, email, serviceInterest };
}

export function createContactRequestCreatedHandler(
  deps: ContactRequestCreatedHandlerDeps,
): (event: OutboxEvent) => Promise<void> {
  return async (event: OutboxEvent): Promise<void> => {
    if (event.eventType !== OUTBOX_EVENT_CONTACT_REQUEST_CREATED) {
      throw new Error(
        `Unexpected event type for contact request handler: ${event.eventType}`,
      );
    }

    const payload = parsePayload(event.payload);

    await deps.leadService.handleContactRequestCreated({
      contactRequestId: payload.contactRequestId,
      email: payload.email,
      serviceInterest: payload.serviceInterest,
      organizationId: event.organizationId,
    });
  };
}

export { OUTBOX_EVENT_CONTACT_REQUEST_CREATED };
