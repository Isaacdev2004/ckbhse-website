import { contactRequests } from '@workspace/db/schema';
import { AppError } from '@workspace/platform/errors';
import type {
  EntityStore,
  SoftDeletableEntity,
  StoreScope,
} from '@workspace/platform/repository';
import { and, eq, isNull } from 'drizzle-orm';
import type { DbExecutor } from '../transaction/transaction-manager.js';
import {
  toContactRequestEntity,
  toContactRequestRow,
  type ContactRequestEntity,
} from '../mappers/contact-request.mapper.js';

export class DrizzleContactRequestStore
  implements EntityStore<ContactRequestEntity>
{
  constructor(private readonly db: DbExecutor) {}

  async get(id: string): Promise<ContactRequestEntity | null> {
    const rows = await this.db
      .select()
      .from(contactRequests)
      .where(eq(contactRequests.id, id))
      .limit(1);

    const row = rows[0];
    return row === undefined ? null : toContactRequestEntity(row);
  }

  async query(scope: StoreScope): Promise<readonly ContactRequestEntity[]> {
    const conditions = [];

    if (scope.organizationId !== null) {
      conditions.push(
        eq(contactRequests.organizationId, scope.organizationId),
      );
    }

    if (!scope.includeDeleted) {
      conditions.push(isNull(contactRequests.deletedAt));
    }

    const where =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const rows = await this.db.select().from(contactRequests).where(where);

    return rows.map(toContactRequestEntity);
  }

  async insert(entity: ContactRequestEntity): Promise<ContactRequestEntity> {
    const existing = await this.get(entity.id);
    if (existing !== null) {
      throw AppError.conflict(`Entity already exists: ${entity.id}`);
    }

    const [row] = await this.db
      .insert(contactRequests)
      .values(toContactRequestRow(entity))
      .returning();

    if (row === undefined) {
      throw AppError.internal('ContactRequest insert did not return a row');
    }

    return toContactRequestEntity(row);
  }

  async replace(entity: ContactRequestEntity): Promise<ContactRequestEntity> {
    const existing = await this.get(entity.id);
    if (existing === null) {
      throw AppError.notFound(`Entity not found: ${entity.id}`);
    }

    const [row] = await this.db
      .update(contactRequests)
      .set(toContactRequestRow(entity))
      .where(eq(contactRequests.id, entity.id))
      .returning();

    if (row === undefined) {
      throw AppError.notFound(`Entity not found: ${entity.id}`);
    }

    return toContactRequestEntity(row);
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(contactRequests).where(eq(contactRequests.id, id));
  }
}

/** In-memory store for tests — mirrors platform `InMemoryEntityStore` semantics. */
export class InMemoryContactRequestStore
  implements EntityStore<ContactRequestEntity>
{
  private readonly rows = new Map<string, ContactRequestEntity>();

  constructor(seed: readonly ContactRequestEntity[] = []) {
    for (const row of seed) {
      this.rows.set(row.id, row);
    }
  }

  get(id: string): Promise<ContactRequestEntity | null> {
    return Promise.resolve(this.rows.get(id) ?? null);
  }

  query(scope: StoreScope): Promise<readonly ContactRequestEntity[]> {
    const results: ContactRequestEntity[] = [];

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

    return Promise.resolve(results);
  }

  async insert(entity: ContactRequestEntity): Promise<ContactRequestEntity> {
    if (this.rows.has(entity.id)) {
      throw AppError.conflict(`Entity already exists: ${entity.id}`);
    }
    this.rows.set(entity.id, entity);
    return entity;
  }

  async replace(entity: ContactRequestEntity): Promise<ContactRequestEntity> {
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
}
