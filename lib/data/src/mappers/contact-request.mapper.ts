import { contactRequests } from '@workspace/db/schema';

type ContactRequestRow = typeof contactRequests.$inferSelect;
import type {
  ContactRequest,
  ContactRequestStatus,
  CreateContactRequestInput,
} from '@workspace/domain/crm';
import { normaliseContactEmail } from '@workspace/domain/crm';
import { asEntityId } from '@workspace/domain/shared';
import type {
  Entity,
  SoftDeletableEntity,
  TenantScopedEntity,
} from '@workspace/platform/repository';

/**
 * Platform entity shape for `ContactRequest` repository operations.
 *
 * Satisfies `Entity`, `SoftDeletableEntity`, and `TenantScopedEntity` so the
 * cross-cutting base repository rules apply unchanged.
 */
export interface ContactRequestEntity
  extends Entity,
    SoftDeletableEntity,
    TenantScopedEntity {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly company: string | null;
  readonly serviceInterest: string;
  readonly message: string;
  readonly status: ContactRequestStatus;
  readonly source: ContactRequest['source'];
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly assignedToUserId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
  readonly createdBy: string | null;
  readonly updatedBy: string | null;
}

export const CONTACT_REQUEST_DEFINITION = {
  name: 'ContactRequest',
  tenantScoped: true,
  softDeletable: true,
  auditIgnoredFields: ['ipAddress', 'userAgent'],
} as const;

export function toContactRequestEntity(
  row: ContactRequestRow,
): ContactRequestEntity {
  if (row.organizationId === null) {
    throw new Error(
      `ContactRequest ${row.id} is missing organizationId — tenant scope is required`,
    );
  }

  return {
    id: asEntityId(row.id),
    organizationId: row.organizationId,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone ?? null,
    company: row.company ?? null,
    serviceInterest: row.serviceInterest,
    message: row.message,
    status: row.status,
    source: row.source,
    ipAddress: row.ipAddress ?? null,
    userAgent: row.userAgent ?? null,
    assignedToUserId: row.assignedToUserId ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
    version: row.version,
    createdBy: row.createdBy ?? null,
    updatedBy: row.updatedBy ?? null,
  };
}

export function toContactRequestRow(
  entity: ContactRequestEntity,
): ContactRequestRow {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    firstName: entity.firstName,
    lastName: entity.lastName,
    email: entity.email,
    phone: entity.phone,
    company: entity.company,
    serviceInterest: entity.serviceInterest,
    message: entity.message,
    status: entity.status,
    source: entity.source,
    ipAddress: entity.ipAddress,
    userAgent: entity.userAgent,
    assignedToUserId: entity.assignedToUserId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
    version: entity.version,
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
  };
}

export function fromCreateInput(
  id: string,
  organizationId: string,
  input: CreateContactRequestInput,
  now: Date = new Date(),
): ContactRequestEntity {
  return {
    id: asEntityId(id),
    organizationId,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: normaliseContactEmail(input.email),
    phone: input.phone ?? null,
    company: input.company ?? null,
    serviceInterest: input.serviceInterest.trim(),
    message: input.message.trim(),
    status: 'received',
    source: input.source ?? 'website',
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    assignedToUserId: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
    createdBy: null,
    updatedBy: null,
  };
}

export function toDomainContactRequest(
  entity: ContactRequestEntity,
): ContactRequest {
  return {
    id: asEntityId(entity.id),
    firstName: entity.firstName,
    lastName: entity.lastName,
    email: entity.email,
    phone: entity.phone,
    company: entity.company,
    serviceInterest: entity.serviceInterest,
    message: entity.message,
    status: entity.status,
    source: entity.source,
    ipAddress: entity.ipAddress,
    userAgent: entity.userAgent,
    assignedToUserId: entity.assignedToUserId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
    version: entity.version,
  };
}
