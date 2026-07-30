import { featureFlags } from '@workspace/db/schema';
import type { FlagOverrideSource } from '@workspace/platform/flags';
import { and, eq, isNull } from 'drizzle-orm';
import type { DbExecutor } from '../transaction/transaction-manager.js';

export interface SetFeatureFlagInput {
  readonly enabled: boolean;
  readonly description?: string | null;
  readonly organizationId?: string | null;
}

/**
 * Database-backed feature flag overrides.
 *
 * `FlagOverrideSource.get` is synchronous, so overrides are loaded into memory
 * via `refresh` before evaluation. Global rows (`organizationId` null) apply
 * everywhere; organisation rows take precedence when refreshing for a tenant.
 */
export class FeatureFlagRepository implements FlagOverrideSource {
  private overrides = new Map<string, boolean>();

  constructor(private readonly db: DbExecutor) {}

  get(key: string): boolean | undefined {
    return this.overrides.get(key);
  }

  async refresh(organizationId?: string): Promise<void> {
    const rows = await this.db.select().from(featureFlags);

    this.overrides.clear();

    for (const row of rows) {
      if (row.organizationId !== null && row.organizationId !== organizationId) {
        continue;
      }

      if (
        row.organizationId === null &&
        organizationId !== undefined &&
        this.overrides.has(row.key)
      ) {
        continue;
      }

      this.overrides.set(row.key, row.enabled);
    }
  }

  async set(key: string, input: SetFeatureFlagInput): Promise<void> {
    const organizationId = input.organizationId ?? null;
    const now = new Date();

    const conditions =
      organizationId === null
        ? and(eq(featureFlags.key, key), isNull(featureFlags.organizationId))
        : and(
            eq(featureFlags.key, key),
            eq(featureFlags.organizationId, organizationId),
          );

    const existing = await this.db
      .select({ id: featureFlags.id })
      .from(featureFlags)
      .where(conditions)
      .limit(1);

    if (existing[0] !== undefined) {
      await this.db
        .update(featureFlags)
        .set({
          enabled: input.enabled,
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          updatedAt: now,
        })
        .where(eq(featureFlags.id, existing[0].id));
      return;
    }

    await this.db.insert(featureFlags).values({
      key,
      enabled: input.enabled,
      description: input.description ?? null,
      organizationId,
      createdAt: now,
      updatedAt: now,
    });
  }

  async remove(key: string, organizationId?: string | null): Promise<boolean> {
    const orgId = organizationId ?? null;
    const conditions =
      orgId === null
        ? and(eq(featureFlags.key, key), isNull(featureFlags.organizationId))
        : and(eq(featureFlags.key, key), eq(featureFlags.organizationId, orgId));

    const deleted = await this.db
      .delete(featureFlags)
      .where(conditions)
      .returning({ id: featureFlags.id });

    return deleted.length > 0;
  }
}
