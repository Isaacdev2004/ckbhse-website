/**
 * Repository contracts.
 *
 * Document 03 makes the repository pattern mandatory and Document 03.5 forbids
 * data access outside one. These interfaces exist so that the cross-cutting
 * obligations — tenant scoping, soft deletion, audit hooks — are satisfied by
 * the base class rather than re-remembered per table.
 *
 * Every method takes the authorization context as its first argument. That is
 * not a style preference: it makes an unscoped query impossible to write without
 * deleting a required parameter, which is the kind of change a reviewer notices.
 */

import type { AuthorizationContext } from '../authorization/index.js';
import type { AuditAction } from '../audit/index.js';
import type { Page, PageRequest, SortSpec } from '../search/index.js';

/** Every persisted entity carries an id. */
export interface Entity {
  readonly id: string;
}

/** An entity belonging to exactly one tenant. */
export interface TenantScopedEntity extends Entity {
  readonly organizationId: string;
}

/**
 * An entity that is retired rather than removed.
 *
 * Soft deletion exists because compliance records must remain reconstructible:
 * an audit finding referenced by an issued report cannot vanish because someone
 * tidied up. `deletedAt` null means live.
 */
export interface SoftDeletableEntity extends Entity {
  readonly deletedAt: Date | null;
}

export interface ListOptions<TField extends string = string> {
  readonly page: PageRequest;
  readonly sort?: SortSpec<TField>;
  /**
   * Include soft-deleted rows. Requires a deliberate opt-in *and*, in
   * implementations, a permission check — restoring visibility of deleted data
   * is a privileged operation, not a query flag.
   */
  readonly includeDeleted?: boolean;
}

/**
 * Read operations.
 *
 * `findById` returning null rather than throwing is intentional: "absent" and
 * "not permitted" must be indistinguishable to the caller, or the API becomes an
 * existence oracle for records in other tenants.
 */
export interface ReadRepository<
  T extends Entity,
  TField extends string = string,
> {
  findById(context: AuthorizationContext, id: string): Promise<T | null>;
  list(
    context: AuthorizationContext,
    options: ListOptions<TField>,
  ): Promise<Page<T>>;
  exists(context: AuthorizationContext, id: string): Promise<boolean>;
}

export interface WriteRepository<T extends Entity, TCreate, TUpdate> {
  create(context: AuthorizationContext, input: TCreate): Promise<T>;
  update(context: AuthorizationContext, id: string, input: TUpdate): Promise<T>;
  /** Soft delete where the entity supports it, hard delete otherwise. */
  delete(context: AuthorizationContext, id: string): Promise<void>;
}

export interface RestorableRepository<T extends Entity> {
  restore(context: AuthorizationContext, id: string): Promise<T>;
}

/**
 * The store a repository reads and writes.
 *
 * Splitting this out is what lets the cross-cutting behaviour in
 * `BaseRepository` be tested exhaustively against an in-memory implementation
 * with no database and no schema, and then bound to Drizzle unchanged when the
 * first table exists.
 */
export interface EntityStore<T extends Entity> {
  get(id: string): Promise<T | null>;
  /** Rows matching the scope, before pagination. */
  query(scope: StoreScope): Promise<readonly T[]>;
  insert(entity: T): Promise<T>;
  replace(entity: T): Promise<T>;
  remove(id: string): Promise<void>;
}

/**
 * The scope a store must apply. Assembled by `BaseRepository` from the
 * authorization context, never by the caller.
 */
export interface StoreScope {
  /** Null means "all tenants" and is only ever produced by a system context. */
  readonly organizationId: string | null;
  readonly includeDeleted: boolean;
}

/**
 * What the base repository needs to know about a particular entity type in
 * order to apply the cross-cutting rules to it.
 */
export interface RepositoryDefinition<T extends Entity> {
  /** Used as the audit `entity` value and in error messages. */
  readonly name: string;
  readonly tenantScoped: boolean;
  readonly softDeletable: boolean;
  /**
   * Fields excluded from audit before/after values, in addition to the global
   * redaction list. Use for large or noisy columns rather than secrets.
   *
   * Constrained to the entity's own keys, so a renamed column turns a silently
   * ineffective exclusion into a compile error.
   */
  readonly auditIgnoredFields?: readonly (keyof T & string)[];
}

/** Emitted by the base repository after a successful mutation. */
export interface RepositoryMutation<T extends Entity> {
  readonly action: AuditAction;
  readonly entity: string;
  readonly entityId: string;
  readonly previous: T | null;
  readonly next: T | null;
}

/**
 * Hook invoked after a mutation commits. The audit recorder is wired in here, so
 * auditing is a property of the base class rather than something each call site
 * opts into.
 */
export interface RepositoryHooks<T extends Entity> {
  afterMutation(
    context: AuthorizationContext,
    mutation: RepositoryMutation<T>,
  ): Promise<void>;
}
