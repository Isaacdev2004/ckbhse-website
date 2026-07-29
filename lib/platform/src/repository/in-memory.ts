/**
 * An in-memory `EntityStore`.
 *
 * This exists so the cross-cutting guarantees in `BaseRepository` — tenant
 * isolation, soft-delete filtering, audit emission — can be tested exhaustively
 * without a database and without the production schema this phase is forbidden
 * from creating.
 *
 * It is also the seam that makes the Drizzle store a drop-in replacement: when
 * the first table lands, only `EntityStore` is reimplemented, and the tests that
 * pin the security behaviour keep passing unchanged.
 *
 * Not for production use: it holds everything in a Map and has no transactions.
 */

import { AppError } from '../errors/index.js';
import type {
  Entity,
  EntityStore,
  SoftDeletableEntity,
  StoreScope,
} from './types.js';

export class InMemoryEntityStore<T extends Entity> implements EntityStore<T> {
  private readonly rows = new Map<string, T>();

  constructor(seed: readonly T[] = []) {
    for (const row of seed) {
      this.rows.set(row.id, row);
    }
  }

  get(id: string): Promise<T | null> {
    return Promise.resolve(this.rows.get(id) ?? null);
  }

  /**
   * Apply the scope the repository computed.
   *
   * A null `organizationId` means "all tenants" and is only reachable from a
   * system context or a non-tenant-scoped entity; the repository, not this
   * store, is what decides that.
   */
  query(scope: StoreScope): Promise<readonly T[]> {
    const results: T[] = [];

    for (const row of this.rows.values()) {
      if (scope.organizationId !== null) {
        const owner = (row as unknown as { organizationId?: string })
          .organizationId;
        if (owner !== scope.organizationId) continue;
      }

      if (!scope.includeDeleted) {
        const deletedAt = (row as Partial<SoftDeletableEntity>).deletedAt;
        if (deletedAt != null) continue;
      }

      results.push(row);
    }

    return Promise.resolve(results);
  }

  // `async` so a constraint violation rejects rather than throwing synchronously
  // from a method typed `Promise<T>`.
  async insert(entity: T): Promise<T> {
    if (this.rows.has(entity.id)) {
      throw AppError.conflict(`Entity already exists: ${entity.id}`);
    }
    this.rows.set(entity.id, entity);
    return entity;
  }

  async replace(entity: T): Promise<T> {
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

  /** Test helper: total rows held, ignoring scope and soft deletion. */
  get size(): number {
    return this.rows.size;
  }

  clear(): void {
    this.rows.clear();
  }
}
