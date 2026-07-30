/** Branded identifier types — prevents cross-wiring UUIDs at compile time. */
export type EntityId = string & { readonly __brand: 'EntityId' };
export type OrganizationId = string & { readonly __brand: 'OrganizationId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type SessionId = string & { readonly __brand: 'SessionId' };

export function asEntityId(value: string): EntityId {
  return value as EntityId;
}

export function asOrganizationId(value: string): OrganizationId {
  return value as OrganizationId;
}

export function asUserId(value: string): UserId {
  return value as UserId;
}

export interface Timestamps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SoftDelete {
  readonly deletedAt: Date | null;
}

export interface AuditStamps {
  readonly createdBy: UserId | null;
  readonly updatedBy: UserId | null;
}

export interface Versioned {
  readonly version: number;
}

export interface TenantScoped {
  readonly organizationId: OrganizationId | null;
}

export type SortDirection = 'asc' | 'desc';

export interface SortSpec<TField extends string = string> {
  readonly field: TField;
  readonly direction: SortDirection;
}

export interface OffsetPage {
  readonly kind: 'offset';
  readonly offset: number;
  readonly limit: number;
}

export interface CursorPage {
  readonly kind: 'cursor';
  readonly cursor?: string;
  readonly limit: number;
}

export type PageRequest = OffsetPage | CursorPage;

export interface Page<T> {
  readonly items: readonly T[];
  readonly hasMore: boolean;
  readonly total?: number;
  readonly nextCursor?: string;
}

export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationDomainError extends DomainError {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message, 'validation_error');
    this.name = 'ValidationDomainError';
  }
}

export class StateTransitionError extends DomainError {
  constructor(entity: string, from: string, to: string) {
    super(
      `${entity} cannot transition from ${from} to ${to}`,
      'invalid_state_transition',
    );
    this.name = 'StateTransitionError';
  }
}
