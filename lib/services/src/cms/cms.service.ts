import type { CmsRepository } from '@workspace/data/repositories/cms';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import { FileContentLoader } from '@workspace/content/loader';
import type {
  CmsDashboardData,
  CmsEntryDetail,
  CmsEntrySummary,
  CmsImportResult,
  CreateCmsEntryInput,
  UpdateCmsDraftInput,
  ScheduleCmsEntryInput,
  CmsWorkflowRunResult,
  CmsContentType,
  CmsEntryStatus,
} from '@workspace/domain/cms';
import { collectCmsImportRecords } from './cms-import.js';

function mapSummary(
  entry: {
    id: string;
    contentType: CmsContentType;
    slug: string;
    path: string;
    title: string;
    status: CmsEntryStatus;
    locale: string;
    category: string | null;
    segment: string | null;
    publishedAt: Date | null;
    updatedAt: Date;
    requiresClientApproval: boolean;
  },
  versionNumber: number | null,
): CmsEntrySummary {
  return {
    id: entry.id,
    contentType: entry.contentType,
    slug: entry.slug,
    path: entry.path,
    title: entry.title,
    status: entry.status,
    locale: entry.locale,
    category: entry.category,
    segment: entry.segment,
    publishedAt: entry.publishedAt?.toISOString() ?? null,
    updatedAt: entry.updatedAt.toISOString(),
    requiresClientApproval: entry.requiresClientApproval,
    versionNumber,
  };
}

export class CmsService {
  constructor(private readonly cms: CmsRepository) {}

  async getDashboard(context: AuthorizationContext): Promise<CmsDashboardData> {
    return this.cms.dashboardCounts(context);
  }

  async listEntries(
    context: AuthorizationContext,
    filters: {
      contentType?: CmsContentType;
      status?: CmsEntryStatus;
      keyword?: string;
      pendingClientApproval?: boolean;
    } = {},
  ): Promise<CmsEntrySummary[]> {
    const rows = await this.cms.list(context, filters);
    return rows.map(({ entry, versionNumber }) =>
      mapSummary(entry, versionNumber ?? null),
    );
  }

  async getEntry(context: AuthorizationContext, entryId: string): Promise<CmsEntryDetail | null> {
    const detail = await this.cms.get(context, entryId);
    if (!detail) {
      return null;
    }

    const { entry, versions, currentVersion } = detail;

    return {
      ...mapSummary(entry, currentVersion?.versionNumber ?? null),
      seo: (entry.seo ?? {}) as Record<string, unknown>,
      reviewDueAt: entry.reviewDueAt?.toISOString() ?? null,
      scheduledAt: entry.scheduledAt?.toISOString() ?? null,
      clientApprovedAt: entry.clientApprovedAt?.toISOString() ?? null,
      currentVersionId: entry.currentVersionId,
      publishedVersionId: entry.publishedVersionId,
      payload: currentVersion?.payload ?? null,
      versions: versions.map((version) => ({
        id: version.id,
        versionNumber: version.versionNumber,
        changeSummary: version.changeSummary,
        createdAt: version.createdAt.toISOString(),
        createdBy: version.createdBy,
        isPublished: version.id === entry.publishedVersionId,
      })),
    };
  }

  async createEntry(context: AuthorizationContext, input: CreateCmsEntryInput) {
    await this.cms.assertPathAvailable(input.path, input.locale ?? 'en-GB');
    const result = await this.cms.create(context, {
      contentType: input.contentType,
      slug: input.slug,
      path: input.path,
      title: input.title,
      ...(input.locale !== undefined ? { locale: input.locale } : {}),
      category: input.category ?? null,
      segment: input.segment ?? null,
      seo: input.seo ?? {},
      payload: input.payload,
      requiresClientApproval: input.requiresClientApproval ?? false,
      changeSummary: input.changeSummary ?? 'Created via CMS',
    });
    return mapSummary(result.entry, result.version.versionNumber);
  }

  async updateDraft(
    context: AuthorizationContext,
    entryId: string,
    input: UpdateCmsDraftInput,
  ) {
    const result = await this.cms.saveDraft(context, entryId, input);
    if (!result) {
      return null;
    }
    return mapSummary(result.entry, result.version.versionNumber);
  }

  async publishEntry(context: AuthorizationContext, entryId: string) {
    const entry = await this.cms.publish(context, entryId);
    if (!entry) {
      return null;
    }
    const detail = await this.cms.get(context, entryId);
    const versionNumber = detail?.currentVersion?.versionNumber ?? null;
    return mapSummary(entry, versionNumber);
  }

  async archiveEntry(context: AuthorizationContext, entryId: string) {
    const entry = await this.cms.archive(context, entryId);
    if (!entry) {
      return null;
    }
    const detail = await this.cms.get(context, entryId);
    const versionNumber = detail?.currentVersion?.versionNumber ?? null;
    return mapSummary(entry, versionNumber);
  }

  async rollbackEntry(
    context: AuthorizationContext,
    entryId: string,
    versionId: string,
  ) {
    const result = await this.cms.rollback(context, entryId, versionId);
    if (!result?.entry) {
      return null;
    }
    return mapSummary(result.entry, result.version.versionNumber);
  }

  async approveClientEntry(context: AuthorizationContext, entryId: string) {
    const entry = await this.cms.approveClient(context, entryId);
    if (!entry) {
      return null;
    }
    const detail = await this.cms.get(context, entryId);
    const versionNumber = detail?.currentVersion?.versionNumber ?? null;
    return mapSummary(entry, versionNumber);
  }

  async scheduleEntry(
    context: AuthorizationContext,
    entryId: string,
    input: ScheduleCmsEntryInput,
  ) {
    const scheduledAt = new Date(input.scheduledAt);
    const reviewDueAt =
      input.reviewDueAt === undefined
        ? undefined
        : input.reviewDueAt === null
          ? null
          : new Date(input.reviewDueAt);
    const entry = await this.cms.schedule(context, entryId, {
      scheduledAt,
      ...(reviewDueAt !== undefined ? { reviewDueAt } : {}),
    });
    if (!entry) {
      return null;
    }
    const detail = await this.cms.get(context, entryId);
    const versionNumber = detail?.currentVersion?.versionNumber ?? null;
    return mapSummary(entry, versionNumber);
  }

  async runDueWorkflow(context: AuthorizationContext, asOf = new Date()): Promise<CmsWorkflowRunResult> {
    const dueEntries = await this.cms.listDueScheduledEntries(context, asOf);
    let published = 0;
    const errors: string[] = [];

    for (const entry of dueEntries) {
      try {
        const result = await this.cms.publish(context, entry.id);
        if (result) {
          published += 1;
        }
      } catch (error) {
        errors.push(
          `${entry.path}: ${error instanceof Error ? error.message : 'Publish failed'}`,
        );
      }
    }

    const reviewReminders = (await this.cms.listDueReviewEntries(context, asOf)).length;
    return { published, reviewReminders, errors };
  }

  async importFromFiles(
    context: AuthorizationContext,
    options: { skipExisting?: boolean } = {},
  ): Promise<CmsImportResult> {
    const loader = new FileContentLoader();
    const records = collectCmsImportRecords(loader);
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const record of records) {
      try {
        if (await this.cms.pathExists(record.path)) {
          if (options.skipExisting !== false) {
            skipped += 1;
            continue;
          }
          errors.push(`Path already exists: ${record.path}`);
          continue;
        }

        await this.cms.create(context, {
          contentType: record.contentType,
          slug: record.slug,
          path: record.path,
          title: record.title,
          category: record.category ?? null,
          segment: record.segment ?? null,
          seo: record.seo,
          payload: record.payload,
          requiresClientApproval: record.requiresClientApproval ?? false,
          changeSummary: 'Imported from lib/content files',
          published: true,
          status: 'published',
        });
        imported += 1;
      } catch (error) {
        errors.push(
          `${record.path}: ${error instanceof Error ? error.message : 'Import failed'}`,
        );
      }
    }

    return { imported, skipped, errors };
  }
}

export function createCmsService(deps: { cms: CmsRepository }) {
  return new CmsService(deps.cms);
}
