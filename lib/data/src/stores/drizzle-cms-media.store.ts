import { cmsMediaAssets } from '@workspace/db/schema';
import type { Database } from '@workspace/db';
import { desc, eq } from 'drizzle-orm';

export class DrizzleCmsMediaStore {
  constructor(private readonly db: Database) {}

  list(limit = 200) {
    return this.db
      .select()
      .from(cmsMediaAssets)
      .orderBy(desc(cmsMediaAssets.createdAt))
      .limit(limit);
  }

  getById(id: string) {
    return this.db.query.cmsMediaAssets.findFirst({
      where: eq(cmsMediaAssets.id, id),
    });
  }

  getByKey(key: string) {
    return this.db.query.cmsMediaAssets.findFirst({
      where: eq(cmsMediaAssets.key, key),
    });
  }

  async create(input: {
    key: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
    publicUrl: string;
    altText?: string | null;
    caption?: string | null;
    createdBy?: string | null;
  }) {
    const [row] = await this.db
      .insert(cmsMediaAssets)
      .values({
        key: input.key,
        filename: input.filename,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        storageKey: input.storageKey,
        publicUrl: input.publicUrl,
        altText: input.altText ?? null,
        caption: input.caption ?? null,
        createdBy: input.createdBy ?? null,
      })
      .returning();
    return row ?? null;
  }
}
