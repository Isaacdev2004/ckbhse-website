/**
 * The base repository.
 *
 * Everything a domain repository must not forget lives here: tenant scoping,
 * permission checks, soft-delete filtering, and audit emission. Subclasses
 * supply a store, a definition and the permissions their entity requires; they
 * do not get a say in whether the rules are applied.
 *
 * The design goal is that the *dangerous* thing is the awkward one. Reading
 * across tenants requires a system context or an explicit cross-tenant
 * permission; resurrecting deleted rows requires an opt-in flag and a
 * permission; and a mutation that skips the audit hook is not expressible
 * because the hook is called by the base class, not the subclass.
 */

import { AppError } from '../errors/index.js';
import {
  requirePermission,
  resolveTenantScope,
  type AuthorizationContext,
} from '../authorization/index.js';
import type { Permission } from '../permissions/index.js';
import { PERMISSIONS } from '../permissions/index.js';
import type { Page, PageRequest } from '../search/index.js';
import type {
  Entity,
  EntityStore,
  ListOptions,
  RepositoryDefinition,
  RepositoryHooks,
  SoftDeletableEntity,
  StoreScope,
} from './types.js';

/** The permissions a repository enforces, one per operation class. */
export interface RepositoryPermissions {
  readonly read: Permission;
  readonly write: Permission;
  /** Defaults to `write` when omitted. */
  readonly delete?: Permission;
  /** Defaults to the platform cross-tenant permission. */
  readonly crossTenantRead?: Permission;
}

export interface BaseRepositoryOptions<T extends Entity> {
  readonly definition: RepositoryDefinition<T>;
  readonly store: EntityStore<T>;
  readonly permissions: RepositoryPermissions;
  readonly hooks?: RepositoryHooks<T>;
}

export abstract class BaseRepository<T extends Entity> {
  protected readonly definition: RepositoryDefinition<T>;
  protected readonly store: EntityStore<T>;
  protected readonly permissions: RepositoryPermissions;
  private readonly hooks: RepositoryHooks<T> | undefined;

  constructor(options: BaseRepositoryOptions<T>) {
    this.definition = options.definition;
    this.store = options.store;
    this.permissions = options.permissions;
    this.hooks = options.hooks;
  }

  // --- Scope -----------------------------------------------------------------

  /**
   * Build the scope for a query.
   *
   * A non-tenant-scoped entity (reference data, the permission catalogue) is
   * scoped to null. For everything else the tenant comes from the context, and
   * `resolveTenantScope` throws rather than returning null for an anonymous
   * caller — so a missing session fails closed instead of querying all tenants.
   */
  protected scopeFor(
    context: AuthorizationContext,
    options: { includeDeleted?: boolean } = {},
  ): StoreScope {
    const includeDeleted = options.includeDeleted ?? false;

    if (includeDeleted) {
      if (!this.definition.softDeletable) {
        throw AppError.badRequest(
          `${this.definition.name} does not support soft deletion`,
        );
      }
      // Deleted rows are only visible to someone trusted to see retired
      // records, which is a different privilege from ordinary reading.
      requirePermission(context, this.deletePermission());
    }

    if (!this.definition.tenantScoped) {
      return { organizationId: null, includeDeleted };
    }

    return {
      organizationId: resolveTenantScope(context),
      includeDeleted,
    };
  }

  private deletePermission(): Permission {
    return this.permissions.delete ?? this.permissions.write;
  }

  private crossTenantPermission(): Permission {
    return this.permissions.crossTenantRead ?? PERMISSIONS.TENANT_VIEW_ALL;
  }

  /**
   * Whether a row that was fetched by id is actually visible to this context.
   *
   * `findById` cannot rely on the query scope alone, because a store lookup by
   * primary key does not filter by tenant. This is the check that stops an id
   * guessed or leaked from another tenant from resolving.
   */
  protected isVisible(
    context: AuthorizationContext,
    entity: T,
    scope: StoreScope,
  ): boolean {
    if (this.definition.softDeletable && !scope.includeDeleted) {
      const deletedAt = (entity as Partial<SoftDeletableEntity>).deletedAt;
      if (deletedAt != null) return false;
    }

    if (!this.definition.tenantScoped) return true;
    if (scope.organizationId === null) return true;

    const owner = (entity as unknown as { organizationId?: string })
      .organizationId;

    if (owner === scope.organizationId) return true;

    // A deliberate, permissioned cross-tenant read. Anything else is invisible.
    return context.permissions.has(this.crossTenantPermission());
  }

  // --- Reads -----------------------------------------------------------------

  async findById(context: AuthorizationContext, id: string): Promise<T | null> {
    requirePermission(context, this.permissions.read);

    const scope = this.scopeFor(context);
    const entity = await this.store.get(id);

    if (entity === null) return null;

    // Null rather than 403: distinguishing "exists but forbidden" from "does not
    // exist" turns the endpoint into an existence oracle for other tenants.
    return this.isVisible(context, entity, scope) ? entity : null;
  }

  /**
   * Fetch by id or throw 404. The message intentionally omits whether the record
   * exists elsewhere.
   */
  async findByIdOrFail(context: AuthorizationContext, id: string): Promise<T> {
    const entity = await this.findById(context, id);
    if (entity === null) {
      throw AppError.notFound(`${this.definition.name} not found`);
    }
    return entity;
  }

  async exists(context: AuthorizationContext, id: string): Promise<boolean> {
    return (await this.findById(context, id)) !== null;
  }

  async list(
    context: AuthorizationContext,
    options: ListOptions,
  ): Promise<Page<T>> {
    requirePermission(context, this.permissions.read);

    const scope = this.scopeFor(context, {
      ...(options.includeDeleted !== undefined
        ? { includeDeleted: options.includeDeleted }
        : {}),
    });

    const rows = await this.store.query(scope);
    const sorted = this.applySort(rows, options);

    return paginate(sorted, options.page);
  }

  /**
   * Ordering is applied in the store for real drivers; the default here keeps
   * the in-memory implementation honest and gives subclasses a single place to
   * override.
   */
  protected applySort(rows: readonly T[], options: ListOptions): readonly T[] {
    const sort = options.sort;
    if (!sort) return rows;

    const direction = sort.direction === 'desc' ? -1 : 1;

    return [...rows].sort((left, right) => {
      const a = (left as unknown as Record<string, unknown>)[sort.field];
      const b = (right as unknown as Record<string, unknown>)[sort.field];
      return compareValues(a, b) * direction;
    });
  }

  // --- Writes ----------------------------------------------------------------

  /**
   * Persist a new entity.
   *
   * The tenant is stamped from the context rather than taken from the input, so
   * a caller cannot create a record inside another organisation. Subclasses
   * build the entity and pass it here; they never call the store directly.
   */
  protected async insert(context: AuthorizationContext, entity: T): Promise<T> {
    requirePermission(context, this.permissions.write);

    const stamped = this.stampTenant(context, entity);
    const created = await this.store.insert(stamped);

    await this.emit(context, {
      action: 'create',
      entity: this.definition.name,
      entityId: created.id,
      previous: null,
      next: created,
    });

    return created;
  }

  /**
   * Apply changes to an existing entity.
   *
   * Loads through `findByIdOrFail`, so the tenant and soft-delete checks run
   * before the write, and passes both states to the audit hook so the before/after
   * diff is available without a second read.
   */
  protected async mutate(
    context: AuthorizationContext,
    id: string,
    apply: (current: T) => T,
  ): Promise<T> {
    requirePermission(context, this.permissions.write);

    const current = await this.findByIdOrFail(context, id);
    const updated = this.stampTenant(context, apply(current));

    if (updated.id !== current.id) {
      throw AppError.internal(
        `${this.definition.name} update must not change the entity id`,
      );
    }

    const persisted = await this.store.replace(updated);

    await this.emit(context, {
      action: 'update',
      entity: this.definition.name,
      entityId: persisted.id,
      previous: current,
      next: persisted,
    });

    return persisted;
  }

  /**
   * Retire an entity: soft delete when supported, hard delete otherwise.
   *
   * A soft delete is recorded as `delete` rather than `update`, because "who
   * removed this and when" is the question the audit log is asked, and burying it
   * in a field diff makes that unanswerable at a glance.
   */
  async delete(context: AuthorizationContext, id: string): Promise<void> {
    requirePermission(context, this.deletePermission());

    const current = await this.findByIdOrFail(context, id);

    if (this.definition.softDeletable) {
      const deleted = {
        ...(current as T & SoftDeletableEntity),
        deletedAt: new Date(),
      };
      const persisted = await this.store.replace(deleted);

      await this.emit(context, {
        action: 'delete',
        entity: this.definition.name,
        entityId: id,
        previous: current,
        next: persisted,
      });
      return;
    }

    await this.store.remove(id);

    await this.emit(context, {
      action: 'delete',
      entity: this.definition.name,
      entityId: id,
      previous: current,
      next: null,
    });
  }

  /** Bring a soft-deleted entity back. Requires the delete permission. */
  async restore(context: AuthorizationContext, id: string): Promise<T> {
    if (!this.definition.softDeletable) {
      throw AppError.badRequest(
        `${this.definition.name} does not support restoration`,
      );
    }

    requirePermission(context, this.deletePermission());

    // includeDeleted, because the row being restored is by definition deleted.
    const scope = this.scopeFor(context, { includeDeleted: true });
    const current = await this.store.get(id);

    if (current === null || !this.isVisible(context, current, scope)) {
      throw AppError.notFound(`${this.definition.name} not found`);
    }

    const restored = {
      ...(current as T & SoftDeletableEntity),
      deletedAt: null,
    };
    const persisted = await this.store.replace(restored);

    await this.emit(context, {
      action: 'restore',
      entity: this.definition.name,
      entityId: id,
      previous: current,
      next: persisted,
    });

    return persisted;
  }

  // --- Internals -------------------------------------------------------------

  private stampTenant(context: AuthorizationContext, entity: T): T {
    if (!this.definition.tenantScoped) return entity;

    const organizationId = resolveTenantScope(context);
    if (organizationId === null) {
      // A system context has no tenant of its own, so it must not be the source
      // of one. Writes on behalf of a tenant need a tenant-scoped context.
      const existing = (entity as unknown as { organizationId?: string })
        .organizationId;
      if (existing === undefined) {
        throw AppError.internal(
          `${this.definition.name} requires an organisation, but the context supplied none`,
        );
      }
      return entity;
    }

    return { ...entity, organizationId };
  }

  private async emit(
    context: AuthorizationContext,
    mutation: Parameters<RepositoryHooks<T>['afterMutation']>[1],
  ): Promise<void> {
    await this.hooks?.afterMutation(context, mutation);
  }
}

// --- Helpers -----------------------------------------------------------------

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();

  return String(a).localeCompare(String(b));
}

/**
 * Slice an already-scoped, already-sorted result set.
 *
 * `hasMore` is computed by asking for the window and checking whether anything
 * follows, rather than by comparing against a total, so it stays correct for
 * queries that deliberately do not compute one.
 */
export function paginate<T extends Entity>(
  rows: readonly T[],
  page: PageRequest,
): Page<T> {
  if (page.kind === 'offset') {
    const items = rows.slice(page.offset, page.offset + page.limit);
    return {
      items,
      hasMore: page.offset + items.length < rows.length,
      total: rows.length,
    };
  }

  const start =
    page.cursor === undefined ? 0 : indexAfterCursor(rows, page.cursor);
  const items = rows.slice(start, start + page.limit);
  const hasMore = start + items.length < rows.length;
  const last = items.at(-1);

  return {
    items,
    hasMore,
    ...(hasMore && last !== undefined ? { nextCursor: last.id } : {}),
  };
}

/**
 * Resolve a cursor to a position.
 *
 * An unrecognised cursor is a client error rather than a silent restart from the
 * beginning, which would otherwise present as an infinite scroll that loops.
 */
function indexAfterCursor<T extends Entity>(
  rows: readonly T[],
  cursor: string,
): number {
  const index = rows.findIndex((row) => row.id === cursor);
  if (index === -1) {
    throw AppError.badRequest('Pagination cursor is no longer valid');
  }
  return index + 1;
}
