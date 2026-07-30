import type {
  EntityId,
  SoftDelete,
  Timestamps,
  Versioned,
} from '../shared/types.js';

export type ContactRequestStatus =
  | 'received'
  | 'triaged'
  | 'assigned'
  | 'converted'
  | 'closed'
  | 'spam';

export interface ContactRequest extends Timestamps, SoftDelete, Versioned {
  readonly id: EntityId;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly company: string | null;
  readonly serviceInterest: string;
  readonly message: string;
  readonly status: ContactRequestStatus;
  readonly source: 'website' | 'portal' | 'api';
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly assignedToUserId: string | null;
}

export interface CreateContactRequestInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string | null;
  readonly company?: string | null;
  readonly serviceInterest: string;
  readonly message: string;
  readonly source?: ContactRequest['source'];
  readonly ipAddress?: string | null;
  readonly userAgent?: string | null;
}

export interface ContactRequestCreatedEvent {
  readonly type: 'crm.contact_request.created';
  readonly contactRequestId: EntityId;
  readonly email: string;
  readonly occurredAt: Date;
}

export const CONTACT_REQUEST_STATUS_TRANSITIONS: Readonly<
  Record<ContactRequestStatus, readonly ContactRequestStatus[]>
> = {
  received: ['triaged', 'assigned', 'closed', 'spam'],
  triaged: ['assigned', 'closed', 'spam'],
  assigned: ['converted', 'closed'],
  converted: ['closed'],
  closed: [],
  spam: [],
};

export function canTransitionContactRequestStatus(
  from: ContactRequestStatus,
  to: ContactRequestStatus,
): boolean {
  return CONTACT_REQUEST_STATUS_TRANSITIONS[from].includes(to);
}

export function normaliseContactEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateContactRequestInput(
  input: CreateContactRequestInput,
): void {
  if (input.firstName.trim().length < 1) {
    throw new Error('First name is required');
  }
  if (input.lastName.trim().length < 1) {
    throw new Error('Last name is required');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    throw new Error('A valid email address is required');
  }
  if (input.serviceInterest.trim().length < 1) {
    throw new Error('Service interest is required');
  }
  if (input.message.trim().length < 10) {
    throw new Error('Message must be at least 10 characters');
  }
}
