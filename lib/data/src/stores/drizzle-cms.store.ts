import {
  cmsEntries,
  cmsEntryVersions,
  type cmsContentTypeEnum,
  type cmsEntryStatusEnum,
} from '@workspace/db/schema';
import type { Database } from '@workspace/db';
import { and, count, desc, eq, ilike, isNotNull, isNull, lte, or } from 'drizzle-orm';

export type CmsContentType = (typeof cmsContentTypeEnum.enumValues)[number];
export type CmsEntryStatus = (typeof cmsEntryStatusEnum.enumValues)[number];

export interface CmsEntryListFilters {
  readonly contentType?: CmsContentType;
  readonly status?: CmsEntryStatus;
  readonly keyword?: string;
  readonly pendingClientApproval?: boolean;
  readonly limit?: number;
}

export interface CreateCmsEntryRowInput {
  readonly contentType: CmsContentType;
  readonly slug: string;
  readonly path: string;
  readonly title: string;
  readonly locale?: string;
  readonly category?: string | null;
  readonly segment?: string | null;
  readonly seo?: Record<string, unknown>;
  readonly status?: CmsEntryStatus;
  readonly requiresClientApproval?: boolean;
  readonly payload: unknown;
  readonly changeSummary?: string | null;
  readonly createdBy?: string | null;
  readonly published?: boolean;
}

export class DrizzleCmsStore {
  constructor(private readonly db: Database) {}

  async dashboardCounts() {
    const now = new Date();
    const [
      totalRow,
      publishedRow,
      draftRow,
      archivedRow,
      reviewRow,
      pendingApprovalRow,
    ] = await Promise.all([
        this.db.select({ total: count() }).from(cmsEntries),
        this.db
          .select({ total: count() })
          .from(cmsEntries)
          .where(eq(cmsEntries.status, 'published')),
        this.db
          .select({ total: count() })
          .from(cmsEntries)
          .where(eq(cmsEntries.status, 'draft')),
        this.db
          .select({ total: count() })
          .from(cmsEntries)
          .where(eq(cmsEntries.status, 'archived')),
        this.db
          .select({ total: count() })
          .from(cmsEntries)
          .where(
            and(
              isNotNull(cmsEntries.reviewDueAt),
              lte(cmsEntries.reviewDueAt, now),
              eq(cmsEntries.status, 'published'),
            ),
          ),
        this.db
          .select({ total: count() })
          .from(cmsEntries)
          .where(
            and(
              eq(cmsEntries.requiresClientApproval, true),
              isNull(cmsEntries.clientApprovedAt),
              or(
                eq(cmsEntries.status, 'draft'),
                eq(cmsEntries.status, 'scheduled'),
              ),
            ),
          ),
      ]);

    return {
      totalEntries: totalRow[0]?.total ?? 0,
      publishedEntries: publishedRow[0]?.total ?? 0,
      draftEntries: draftRow[0]?.total ?? 0,
      archivedEntries: archivedRow[0]?.total ?? 0,
      pendingReviewEntries: reviewRow[0]?.total ?? 0,
      pendingClientApprovalEntries: pendingApprovalRow[0]?.total ?? 0,
    };
  }

  listEntries(filters: CmsEntryListFilters = {}) {
    const conditions = [];
    if (filters.contentType) {
      conditions.push(eq(cmsEntries.contentType, filters.contentType));
    }
    if (filters.status) {
      conditions.push(eq(cmsEntries.status, filters.status));
    }
    if (filters.keyword) {
      const pattern = `%${filters.keyword}%`;
      conditions.push(
        or(
          ilike(cmsEntries.title, pattern),
          ilike(cmsEntries.slug, pattern),
          ilike(cmsEntries.path, pattern),
        ),
      );
    }
    if (filters.pendingClientApproval === true) {
      conditions.push(
        and(
          eq(cmsEntries.requiresClientApproval, true),
          isNull(cmsEntries.clientApprovedAt),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return this.db
      .select({
        entry: cmsEntries,
        versionNumber: cmsEntryVersions.versionNumber,
      })
      .from(cmsEntries)
      .leftJoin(
        cmsEntryVersions,
        eq(cmsEntries.currentVersionId, cmsEntryVersions.id),
      )
      .where(whereClause)
      .orderBy(desc(cmsEntries.updatedAt))
      .limit(filters.limit ?? 200);
  }

  getEntryById(entryId: string) {
    return this.db.query.cmsEntries.findFirst({
      where: eq(cmsEntries.id, entryId),
    });
  }

  getEntryByPath(path: string, locale = 'en-GB') {
    return this.db.query.cmsEntries.findFirst({
      where: and(eq(cmsEntries.path, path), eq(cmsEntries.locale, locale)),
    });
  }

  listVersions(entryId: string) {
    return this.db
      .select()
      .from(cmsEntryVersions)
      .where(eq(cmsEntryVersions.entryId, entryId))
      .orderBy(desc(cmsEntryVersions.versionNumber));
  }

  getVersion(versionId: string) {
    return this.db.query.cmsEntryVersions.findFirst({
      where: eq(cmsEntryVersions.id, versionId),
    });
  }

  async createEntry(input: CreateCmsEntryRowInput) {
    return this.db.transaction(async (tx) => {
      const [entry] = await tx
        .insert(cmsEntries)
        .values({
          contentType: input.contentType,
          slug: input.slug,
          path: input.path,
          title: input.title,
          locale: input.locale ?? 'en-GB',
          category: input.category ?? null,
          segment: input.segment ?? null,
          seo: input.seo ?? {},
          status: input.status ?? 'draft',
          requiresClientApproval: input.requiresClientApproval ?? false,
          createdBy: input.createdBy ?? null,
          updatedBy: input.createdBy ?? null,
        })
        .returning();

      if (!entry) {
        throw new Error('Failed to create CMS entry');
      }

      const [version] = await tx
        .insert(cmsEntryVersions)
        .values({
          entryId: entry.id,
          versionNumber: 1,
          payload: input.payload,
          changeSummary: input.changeSummary ?? 'Initial version',
          createdBy: input.createdBy ?? null,
        })
        .returning();

      if (!version) {
        throw new Error('Failed to create CMS entry version');
      }

      const published = input.published === true;
      const [updated] = await tx
        .update(cmsEntries)
        .set({
          currentVersionId: version.id,
          publishedVersionId: published ? version.id : null,
          status: published ? 'published' : (input.status ?? 'draft'),
          publishedAt: published ? new Date() : null,
          updatedAt: new Date(),
          updatedBy: input.createdBy ?? null,
        })
        .where(eq(cmsEntries.id, entry.id))
        .returning();

      return { entry: updated ?? entry, version };
    });
  }

  async saveDraft(
    entryId: string,
    input: {
      title?: string;
      seo?: Record<string, unknown>;
      payload: unknown;
      changeSummary?: string | null;
      userId?: string | null;
    },
  ) {
    return this.db.transaction(async (tx) => {
      const entry = await tx.query.cmsEntries.findFirst({
        where: eq(cmsEntries.id, entryId),
      });
      if (!entry) {
        return null;
      }

      const [latest] = await tx
        .select({ versionNumber: cmsEntryVersions.versionNumber })
        .from(cmsEntryVersions)
        .where(eq(cmsEntryVersions.entryId, entryId))
        .orderBy(desc(cmsEntryVersions.versionNumber))
        .limit(1);

      const nextVersion = (latest?.versionNumber ?? 0) + 1;
      const [version] = await tx
        .insert(cmsEntryVersions)
        .values({
          entryId,
          versionNumber: nextVersion,
          payload: input.payload,
          changeSummary: input.changeSummary ?? `Draft v${nextVersion}`,
          createdBy: input.userId ?? null,
        })
        .returning();

      if (!version) {
        throw new Error('Failed to save CMS draft');
      }

      const patch: Partial<typeof cmsEntries.$inferInsert> = {
        currentVersionId: version.id,
        updatedAt: new Date(),
        updatedBy: input.userId ?? null,
      };
      if (input.title !== undefined) {
        patch.title = input.title;
      }
      if (input.seo !== undefined) {
        patch.seo = input.seo;
      }

      const [updated] = await tx
        .update(cmsEntries)
        .set(patch)
        .where(eq(cmsEntries.id, entryId))
        .returning();

      return { entry: updated ?? entry, version };
    });
  }

  async publishEntry(entryId: string, userId?: string | null) {
    return this.db.transaction(async (tx) => {
      const entry = await tx.query.cmsEntries.findFirst({
        where: eq(cmsEntries.id, entryId),
      });
      if (!entry?.currentVersionId) {
        return null;
      }

      const [updated] = await tx
        .update(cmsEntries)
        .set({
          status: 'published',
          publishedVersionId: entry.currentVersionId,
          publishedAt: new Date(),
          updatedAt: new Date(),
          updatedBy: userId ?? null,
        })
        .where(eq(cmsEntries.id, entryId))
        .returning();

      return updated ?? null;
    });
  }

  async archiveEntry(entryId: string, userId?: string | null) {
    const [updated] = await this.db
      .update(cmsEntries)
      .set({
        status: 'archived',
        updatedAt: new Date(),
        updatedBy: userId ?? null,
      })
      .where(eq(cmsEntries.id, entryId))
      .returning();

    return updated ?? null;
  }

  async rollbackToVersion(entryId: string, versionId: string, userId?: string | null) {
    return this.db.transaction(async (tx) => {
      const version = await tx.query.cmsEntryVersions.findFirst({
        where: and(
          eq(cmsEntryVersions.id, versionId),
          eq(cmsEntryVersions.entryId, entryId),
        ),
      });
      if (!version) {
        return null;
      }

      const [latest] = await tx
        .select({ versionNumber: cmsEntryVersions.versionNumber })
        .from(cmsEntryVersions)
        .where(eq(cmsEntryVersions.entryId, entryId))
        .orderBy(desc(cmsEntryVersions.versionNumber))
        .limit(1);

      const nextVersion = (latest?.versionNumber ?? 0) + 1;
      const [created] = await tx
        .insert(cmsEntryVersions)
        .values({
          entryId,
          versionNumber: nextVersion,
          payload: version.payload,
          changeSummary: `Rollback to v${version.versionNumber}`,
          createdBy: userId ?? null,
        })
        .returning();

      if (!created) {
        throw new Error('Failed to rollback CMS entry');
      }

      const [updated] = await tx
        .update(cmsEntries)
        .set({
          currentVersionId: created.id,
          status: 'draft',
          updatedAt: new Date(),
          updatedBy: userId ?? null,
        })
        .where(eq(cmsEntries.id, entryId))
        .returning();

      return { entry: updated ?? null, version: created };
    });
  }

  countEntriesByPath(path: string, locale = 'en-GB') {
    return this.db
      .select({ total: count() })
      .from(cmsEntries)
      .where(and(eq(cmsEntries.path, path), eq(cmsEntries.locale, locale)));
  }

  listPublishedEntries(locale = 'en-GB') {
    return this.db
      .select({
        id: cmsEntries.id,
        contentType: cmsEntries.contentType,
        slug: cmsEntries.slug,
        path: cmsEntries.path,
        title: cmsEntries.title,
        category: cmsEntries.category,
        segment: cmsEntries.segment,
        seo: cmsEntries.seo,
        publishedAt: cmsEntries.publishedAt,
        payload: cmsEntryVersions.payload,
      })
      .from(cmsEntries)
      .innerJoin(
        cmsEntryVersions,
        eq(cmsEntries.publishedVersionId, cmsEntryVersions.id),
      )
      .where(and(eq(cmsEntries.status, 'published'), eq(cmsEntries.locale, locale)))
      .orderBy(cmsEntries.path);
  }

  getPublishedByPath(path: string, locale = 'en-GB') {
    return this.db
      .select({
        id: cmsEntries.id,
        contentType: cmsEntries.contentType,
        slug: cmsEntries.slug,
        path: cmsEntries.path,
        title: cmsEntries.title,
        category: cmsEntries.category,
        segment: cmsEntries.segment,
        seo: cmsEntries.seo,
        publishedAt: cmsEntries.publishedAt,
        payload: cmsEntryVersions.payload,
      })
      .from(cmsEntries)
      .innerJoin(
        cmsEntryVersions,
        eq(cmsEntries.publishedVersionId, cmsEntryVersions.id),
      )
      .where(
        and(
          eq(cmsEntries.status, 'published'),
          eq(cmsEntries.path, path),
          eq(cmsEntries.locale, locale),
        ),
      )
      .limit(1);
  }

  listSeoSummaries(locale = 'en-GB') {
    return this.db
      .select({
        id: cmsEntries.id,
        path: cmsEntries.path,
        title: cmsEntries.title,
        contentType: cmsEntries.contentType,
        status: cmsEntries.status,
        seo: cmsEntries.seo,
        publishedAt: cmsEntries.publishedAt,
      })
      .from(cmsEntries)
      .where(eq(cmsEntries.locale, locale))
      .orderBy(cmsEntries.path);
  }

  updateEntrySeo(entryId: string, seo: Record<string, unknown>, userId?: string | null) {
    return this.db
      .update(cmsEntries)
      .set({
        seo,
        updatedAt: new Date(),
        updatedBy: userId ?? null,
      })
      .where(eq(cmsEntries.id, entryId))
      .returning();
  }

  approveClientEntry(entryId: string, userId?: string | null) {
    return this.db
      .update(cmsEntries)
      .set({
        clientApprovedAt: new Date(),
        clientApprovedBy: userId ?? null,
        updatedAt: new Date(),
        updatedBy: userId ?? null,
      })
      .where(
        and(
          eq(cmsEntries.id, entryId),
          eq(cmsEntries.requiresClientApproval, true),
          isNull(cmsEntries.clientApprovedAt),
        ),
      )
      .returning();
  }

  scheduleEntry(entryId: string, scheduledAt: Date, userId?: string | null) {
    return this.db
      .update(cmsEntries)
      .set({
        status: 'scheduled',
        scheduledAt,
        updatedAt: new Date(),
        updatedBy: userId ?? null,
      })
      .where(eq(cmsEntries.id, entryId))
      .returning();
  }

  setReviewDueAt(entryId: string, reviewDueAt: Date | null, userId?: string | null) {
    return this.db
      .update(cmsEntries)
      .set({
        reviewDueAt,
        updatedAt: new Date(),
        updatedBy: userId ?? null,
      })
      .where(eq(cmsEntries.id, entryId))
      .returning();
  }

  listDueScheduledEntries(asOf = new Date()) {
    return this.db
      .select()
      .from(cmsEntries)
      .where(
        and(
          eq(cmsEntries.status, 'scheduled'),
          isNotNull(cmsEntries.scheduledAt),
          lte(cmsEntries.scheduledAt, asOf),
        ),
      );
  }

  listDueReviewEntries(asOf = new Date()) {
    return this.db
      .select({
        id: cmsEntries.id,
        path: cmsEntries.path,
        title: cmsEntries.title,
        reviewDueAt: cmsEntries.reviewDueAt,
      })
      .from(cmsEntries)
      .where(
        and(
          eq(cmsEntries.status, 'published'),
          isNotNull(cmsEntries.reviewDueAt),
          lte(cmsEntries.reviewDueAt, asOf),
        ),
      );
  }
}
