import { leads } from '@workspace/db/schema';
import type { LeadPriority, LeadStatus } from '@workspace/domain/crm';
import { AppError } from '@workspace/platform/errors';
import type {
  EntityStore,
  SoftDeletableEntity,
  StoreScope,
} from '@workspace/platform/repository';
import {
  and,
  eq,
  gte,
  ilike,
  isNull,
  lte,
  or,
} from 'drizzle-orm';
import type { DbExecutor } from '../transaction/transaction-manager.js';
import {
  toLeadEntity,
  toLeadRow,
  type LeadEntity,
} from '../mappers/lead.mapper.js';

export interface LeadSearchFilters {
  readonly keyword?: string;
  readonly status?: LeadStatus | LeadStatus[];
  readonly priority?: LeadPriority | LeadPriority[];
  readonly assignedToUserId?: string | null;
  readonly createdFrom?: Date;
  readonly createdTo?: Date;
}

export interface LeadEntityStore extends EntityStore<LeadEntity> {
  search(
    scope: StoreScope,
    filters: LeadSearchFilters,
  ): Promise<readonly LeadEntity[]>;
  findByContactRequestId(
    contactRequestId: string,
  ): Promise<LeadEntity | null>;
}

function matchesKeyword(entity: LeadEntity, keyword: string): boolean {
  const term = keyword.trim().toLowerCase();
  if (term.length === 0) return true;

  const haystack = [
    entity.firstName,
    entity.lastName,
    `${entity.firstName} ${entity.lastName}`,
    entity.email,
    entity.company ?? '',
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
}

function matchesStatusFilter(
  entity: LeadEntity,
  status: LeadStatus | LeadStatus[],
): boolean {
  return Array.isArray(status)
    ? status.includes(entity.status)
    : entity.status === status;
}

function matchesPriorityFilter(
  entity: LeadEntity,
  priority: LeadPriority | LeadPriority[],
): boolean {
  return Array.isArray(priority)
    ? priority.includes(entity.priority)
    : entity.priority === priority;
}

function applyLeadFilters(
  rows: readonly LeadEntity[],
  filters: LeadSearchFilters,
): readonly LeadEntity[] {
  return rows.filter((row) => {
    if (filters.keyword !== undefined && !matchesKeyword(row, filters.keyword)) {
      return false;
    }

    if (
      filters.status !== undefined &&
      !matchesStatusFilter(row, filters.status)
    ) {
      return false;
    }

    if (
      filters.priority !== undefined &&
      !matchesPriorityFilter(row, filters.priority)
    ) {
      return false;
    }

    if (filters.assignedToUserId !== undefined) {
      if (filters.assignedToUserId === null) {
        if (row.assignedToUserId !== null) return false;
      } else if (row.assignedToUserId !== filters.assignedToUserId) {
        return false;
      }
    }

    if (filters.createdFrom !== undefined && row.createdAt < filters.createdFrom) {
      return false;
    }

    if (filters.createdTo !== undefined && row.createdAt > filters.createdTo) {
      return false;
    }

    return true;
  });
}

function buildLeadSearchConditions(
  scope: StoreScope,
  filters: LeadSearchFilters,
) {
  const conditions = [];

  if (scope.organizationId !== null) {
    conditions.push(eq(leads.organizationId, scope.organizationId));
  }

  if (!scope.includeDeleted) {
    conditions.push(isNull(leads.deletedAt));
  }

  if (filters.keyword !== undefined) {
    const term = filters.keyword.trim();
    if (term.length > 0) {
      const pattern = `%${term}%`;
      conditions.push(
        or(
          ilike(leads.firstName, pattern),
          ilike(leads.lastName, pattern),
          ilike(leads.email, pattern),
          ilike(leads.company, pattern),
        ),
      );
    }
  }

  if (filters.status !== undefined) {
    const statusFilter = filters.status;
    if (Array.isArray(statusFilter)) {
      conditions.push(
        or(...statusFilter.map((status) => eq(leads.status, status))),
      );
    } else {
      conditions.push(eq(leads.status, statusFilter));
    }
  }

  if (filters.priority !== undefined) {
    const priorityFilter = filters.priority;
    if (Array.isArray(priorityFilter)) {
      conditions.push(
        or(
          ...priorityFilter.map((priority) => eq(leads.priority, priority)),
        ),
      );
    } else {
      conditions.push(eq(leads.priority, priorityFilter));
    }
  }

  if (filters.assignedToUserId !== undefined) {
    if (filters.assignedToUserId === null) {
      conditions.push(isNull(leads.assignedToUserId));
    } else {
      conditions.push(eq(leads.assignedToUserId, filters.assignedToUserId));
    }
  }

  if (filters.createdFrom !== undefined) {
    conditions.push(gte(leads.createdAt, filters.createdFrom));
  }

  if (filters.createdTo !== undefined) {
    conditions.push(lte(leads.createdAt, filters.createdTo));
  }

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return and(...conditions);
}

export class DrizzleLeadStore implements LeadEntityStore {
  constructor(private readonly db: DbExecutor) {}

  async get(id: string): Promise<LeadEntity | null> {
    const rows = await this.db
      .select()
      .from(leads)
      .where(eq(leads.id, id))
      .limit(1);

    const row = rows[0];
    return row === undefined ? null : toLeadEntity(row);
  }

  async query(scope: StoreScope): Promise<readonly LeadEntity[]> {
    return this.search(scope, {});
  }

  async search(
    scope: StoreScope,
    filters: LeadSearchFilters,
  ): Promise<readonly LeadEntity[]> {
    const where = buildLeadSearchConditions(scope, filters);
    const rows = await this.db.select().from(leads).where(where);

    return rows.map(toLeadEntity);
  }

  async insert(entity: LeadEntity): Promise<LeadEntity> {
    const existing = await this.get(entity.id);
    if (existing !== null) {
      throw AppError.conflict(`Entity already exists: ${entity.id}`);
    }

    const [row] = await this.db
      .insert(leads)
      .values(toLeadRow(entity))
      .returning();

    if (row === undefined) {
      throw AppError.internal('Lead insert did not return a row');
    }

    return toLeadEntity(row);
  }

  async replace(entity: LeadEntity): Promise<LeadEntity> {
    const existing = await this.get(entity.id);
    if (existing === null) {
      throw AppError.notFound(`Entity not found: ${entity.id}`);
    }

    const [row] = await this.db
      .update(leads)
      .set(toLeadRow(entity))
      .where(eq(leads.id, entity.id))
      .returning();

    if (row === undefined) {
      throw AppError.notFound(`Entity not found: ${entity.id}`);
    }

    return toLeadEntity(row);
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(leads).where(eq(leads.id, id));
  }

  async findByContactRequestId(
    contactRequestId: string,
  ): Promise<LeadEntity | null> {
    const rows = await this.db
      .select()
      .from(leads)
      .where(eq(leads.contactRequestId, contactRequestId))
      .limit(1);

    const row = rows[0];
    return row === undefined ? null : toLeadEntity(row);
  }
}

/** In-memory store for tests — mirrors platform `InMemoryEntityStore` semantics. */
export class InMemoryLeadStore implements LeadEntityStore {
  private readonly rows = new Map<string, LeadEntity>();

  constructor(seed: readonly LeadEntity[] = []) {
    for (const row of seed) {
      this.rows.set(row.id, row);
    }
  }

  get(id: string): Promise<LeadEntity | null> {
    return Promise.resolve(this.rows.get(id) ?? null);
  }

  query(scope: StoreScope): Promise<readonly LeadEntity[]> {
    return this.search(scope, {});
  }

  search(
    scope: StoreScope,
    filters: LeadSearchFilters,
  ): Promise<readonly LeadEntity[]> {
    const results: LeadEntity[] = [];

    for (const row of this.rows.values()) {
      if (scope.organizationId !== null) {
        if (row.organizationId !== scope.organizationId) continue;
      }

      if (!scope.includeDeleted) {
        const deletedAt = (row as Partial<SoftDeletableEntity>).deletedAt;
        if (deletedAt != null) continue;
      }

      results.push(row);
    }

    return Promise.resolve(applyLeadFilters(results, filters));
  }

  async insert(entity: LeadEntity): Promise<LeadEntity> {
    if (this.rows.has(entity.id)) {
      throw AppError.conflict(`Entity already exists: ${entity.id}`);
    }
    this.rows.set(entity.id, entity);
    return entity;
  }

  async replace(entity: LeadEntity): Promise<LeadEntity> {
    if (!this.rows.has(entity.id)) {
      throw AppError.notFound(`Entity not found: ${entity.id}`);
    }
    this.rows.set(entity.id, entity);
    return entity;
  }

  remove(id: string): Promise<void> {
    this.rows.delete(id);
    return Promise.resolve();
  }

  findByContactRequestId(
    contactRequestId: string,
  ): Promise<LeadEntity | null> {
    for (const row of this.rows.values()) {
      if (row.contactRequestId === contactRequestId) {
        return Promise.resolve(row);
      }
    }
    return Promise.resolve(null);
  }
}
