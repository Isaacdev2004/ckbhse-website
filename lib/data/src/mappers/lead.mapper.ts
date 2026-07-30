import { leads } from '@workspace/db/schema';

type LeadRow = typeof leads.$inferSelect;
import type {
  CreateLeadFromContactInput,
  Lead,
  LeadPriority,
  LeadSource,
  LeadStatus,
} from '@workspace/domain/crm';
import { normaliseContactEmail } from '@workspace/domain/crm';
import { asEntityId, asOrganizationId, asUserId } from '@workspace/domain/shared';
import type {
  Entity,
  SoftDeletableEntity,
  TenantScopedEntity,
} from '@workspace/platform/repository';

/**
 * Platform entity shape for `Lead` repository operations.
 */
export interface LeadEntity
  extends Entity,
    SoftDeletableEntity,
    TenantScopedEntity {
  readonly contactRequestId: string | null;
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
  readonly assignedToUserId: string | null;
  readonly score: number | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
  readonly createdBy: string | null;
  readonly updatedBy: string | null;
}

export const LEAD_DEFINITION = {
  name: 'Lead',
  tenantScoped: true,
  softDeletable: true,
} as const;

export function toLeadEntity(row: LeadRow): LeadEntity {
  if (row.organizationId === null) {
    throw new Error(
      `Lead ${row.id} is missing organizationId — tenant scope is required`,
    );
  }

  return {
    id: asEntityId(row.id),
    organizationId: row.organizationId,
    contactRequestId: row.contactRequestId ?? null,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone ?? null,
    company: row.company ?? null,
    serviceInterest: row.serviceInterest,
    industry: row.industry ?? null,
    trainingInterest: row.trainingInterest ?? null,
    message: row.message ?? null,
    status: row.status,
    priority: row.priority,
    source: row.source,
    assignedToUserId: row.assignedToUserId ?? null,
    score: row.score ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
    version: row.version,
    createdBy: row.createdBy ?? null,
    updatedBy: row.updatedBy ?? null,
  };
}

export function toLeadRow(entity: LeadEntity): LeadRow {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    contactRequestId: entity.contactRequestId,
    firstName: entity.firstName,
    lastName: entity.lastName,
    email: entity.email,
    phone: entity.phone,
    company: entity.company,
    serviceInterest: entity.serviceInterest,
    industry: entity.industry,
    trainingInterest: entity.trainingInterest,
    message: entity.message,
    status: entity.status,
    priority: entity.priority,
    source: entity.source,
    assignedToUserId: entity.assignedToUserId,
    score: entity.score,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
    version: entity.version,
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
  };
}

export function fromContactRequestInput(
  id: string,
  input: CreateLeadFromContactInput,
  now: Date = new Date(),
): LeadEntity {
  return {
    id: asEntityId(id),
    organizationId: input.organizationId,
    contactRequestId: input.contactRequestId,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: normaliseContactEmail(input.email),
    phone: input.phone ?? null,
    company: input.company ?? null,
    serviceInterest: input.serviceInterest.trim(),
    industry: null,
    trainingInterest: null,
    message: input.message?.trim() ?? null,
    status: 'new',
    priority: 'normal',
    source: input.source ?? 'website',
    assignedToUserId: null,
    score: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
    createdBy: null,
    updatedBy: null,
  };
}

export function toDomainLead(entity: LeadEntity): Lead {
  return {
    id: asEntityId(entity.id),
    organizationId: asOrganizationId(entity.organizationId),
    contactRequestId:
      entity.contactRequestId !== null
        ? asEntityId(entity.contactRequestId)
        : null,
    firstName: entity.firstName,
    lastName: entity.lastName,
    email: entity.email,
    phone: entity.phone,
    company: entity.company,
    serviceInterest: entity.serviceInterest,
    industry: entity.industry,
    trainingInterest: entity.trainingInterest,
    message: entity.message,
    status: entity.status,
    priority: entity.priority,
    source: entity.source,
    assignedToUserId:
      entity.assignedToUserId !== null
        ? asUserId(entity.assignedToUserId)
        : null,
    score: entity.score,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
    version: entity.version,
  };
}
