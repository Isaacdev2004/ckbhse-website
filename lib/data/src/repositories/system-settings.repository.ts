import { systemSettings } from '@workspace/db/schema';
import { eq } from 'drizzle-orm';
import type { DbExecutor } from '../transaction/transaction-manager.js';

export interface SetSystemSettingInput {
  readonly value: unknown;
  readonly description?: string;
  readonly isSecret?: boolean;
}

export class SystemSettingsRepository {
  constructor(private readonly db: DbExecutor) {}

  async get<T = unknown>(key: string): Promise<T | null> {
    const rows = await this.db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    const row = rows[0];
    if (row === undefined) return null;

    return row.value as T;
  }

  async set(key: string, input: SetSystemSettingInput): Promise<void> {
    const now = new Date();
    const existing = await this.db
      .select({ id: systemSettings.id })
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    if (existing[0] !== undefined) {
      await this.db
        .update(systemSettings)
        .set({
          value: input.value,
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.isSecret !== undefined ? { isSecret: input.isSecret } : {}),
          updatedAt: now,
        })
        .where(eq(systemSettings.key, key));
      return;
    }

    await this.db.insert(systemSettings).values({
      key,
      value: input.value,
      description: input.description ?? null,
      isSecret: input.isSecret ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await this.db
      .delete(systemSettings)
      .where(eq(systemSettings.key, key))
      .returning({ id: systemSettings.id });

    return deleted.length > 0;
  }
}
