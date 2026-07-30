import type {
  EntityId,
  OrganizationId,
  SoftDelete,
  Timestamps,
  UserId,
  Versioned,
} from '../shared/types.js';

export type LeadStatus =
  | 'new'
  | 'acknowledged'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'archived';

export type LeadPriority = 'low' | 'normal' | 'high' | 'urgent';

export type LeadSource =
  | 'website'
  | 'referral'
  | 'phone'
  | 'email'
  | 'event'
  | 'partner'
  | 'other';

export interface Lead extends Timestamps, SoftDelete, Versioned {
  readonly id: EntityId;
  readonly organizationId: OrganizationId;
  readonly contactRequestId: EntityId | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly company: string | null;
  readonly serviceInterest: string;
  readonly industry: string | null;
  readonly trainingInterest: string | null;
  readonly message: string | null;
  readonly status: LeadStatus;
  readonly priority: LeadPriority;
  readonly source: LeadSource;
  readonly assignedToUserId: UserId | null;
  readonly score: number | null;
}

export interface CreateLeadFromContactInput {
  readonly contactRequestId: EntityId;
  readonly organizationId: OrganizationId;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string | null;
  readonly company?: string | null;
  readonly serviceInterest: string;
  readonly message?: string | null;
  readonly source?: LeadSource;
}

export type LeadActivityType =
  | 'email_sent'
  | 'status_changed'
  | 'assignment'
  | 'phone_call'
  | 'meeting'
  | 'document_uploaded'
  | 'reminder'
  | 'note_added'
  | 'lead_created';

export interface LeadActivity extends Timestamps {
  readonly id: EntityId;
  readonly leadId: EntityId;
  readonly organizationId: OrganizationId;
  readonly activityType: LeadActivityType;
  readonly title: string;
  readonly description: string | null;
  readonly actorUserId: UserId | null;
  readonly metadata: Readonly<Record<string, unknown>> | null;
}

export interface LeadNote extends Timestamps, SoftDelete, Versioned {
  readonly id: EntityId;
  readonly leadId: EntityId;
  readonly organizationId: OrganizationId;
  readonly body: string;
  readonly isInternal: boolean;
  readonly authorUserId: UserId;
}

export interface LeadAssignment extends Timestamps {
  readonly id: EntityId;
  readonly leadId: EntityId;
  readonly organizationId: OrganizationId;
  readonly assignedToUserId: UserId;
  readonly assignedByUserId: UserId | null;
  readonly reason: string | null;
  readonly isActive: boolean;
}

export interface LeadReminder extends Timestamps, SoftDelete, Versioned {
  readonly id: EntityId;
  readonly leadId: EntityId;
  readonly organizationId: OrganizationId;
  readonly title: string;
  readonly dueAt: Date;
  readonly priority: LeadPriority;
  readonly completedAt: Date | null;
  readonly assignedToUserId: UserId | null;
  readonly isRecurring: boolean;
  readonly recurrenceRule: string | null;
}

export interface LeadTag {
  readonly id: EntityId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly color: string | null;
}

export interface LeadStatusHistoryEntry extends Timestamps {
  readonly id: EntityId;
  readonly leadId: EntityId;
  readonly organizationId: OrganizationId;
  readonly fromStatus: LeadStatus | null;
  readonly toStatus: LeadStatus;
  readonly changedByUserId: UserId | null;
  readonly reason: string | null;
}
