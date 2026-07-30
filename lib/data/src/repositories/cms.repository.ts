import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type {
  CmsContentType,
  CmsEntryStatus,
  CreateCmsEntryRowInput,
  DrizzleCmsStore,
} from '../stores/drizzle-cms.store.js';

export class CmsRepository {
  constructor(private readonly store: DrizzleCmsStore) {}

  dashboardCounts(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.CONTENT_READ);
    return this.store.dashboardCounts();
  }

  list(
    context: AuthorizationContext,
    filters: {
      contentType?: CmsContentType;
      status?: CmsEntryStatus;
      keyword?: string;
      pendingClientApproval?: boolean;
      limit?: number;
    } = {},
  ) {
    requirePermission(context, PERMISSIONS.CONTENT_READ);
    return this.store.listEntries(filters);
  }

  async get(context: AuthorizationContext, entryId: string) {
    requirePermission(context, PERMISSIONS.CONTENT_READ);
    const entry = await this.store.getEntryById(entryId);
    if (!entry) {
      return null;
    }
    const versions = await this.store.listVersions(entryId);
    const currentVersion = entry.currentVersionId
      ? versions.find((row) => row.id === entry.currentVersionId) ?? null
      : null;
    return { entry, versions, currentVersion };
  }

  create(context: AuthorizationContext, input: CreateCmsEntryRowInput) {
    requirePermission(context, PERMISSIONS.CONTENT_MANAGE);
    return this.store.createEntry({
      ...input,
      createdBy: context.userId ?? null,
    });
  }

  saveDraft(
    context: AuthorizationContext,
    entryId: string,
    input: {
      title?: string;
      seo?: Record<string, unknown>;
      payload: unknown;
      changeSummary?: string | null;
    },
  ) {
    requirePermission(context, PERMISSIONS.CONTENT_MANAGE);
    return this.store.saveDraft(entryId, {
      ...input,
      userId: context.userId ?? null,
    });
  }

  async publish(context: AuthorizationContext, entryId: string) {
    requirePermission(context, PERMISSIONS.CONTENT_PUBLISH);
    const entry = await this.store.getEntryById(entryId);
    if (!entry) {
      return null;
    }
    this.assertClientApproval(entry);
    return this.store.publishEntry(entryId, context.userId ?? null);
  }

  archive(context: AuthorizationContext, entryId: string) {
    requirePermission(context, PERMISSIONS.CONTENT_MANAGE);
    return this.store.archiveEntry(entryId, context.userId ?? null);
  }

  rollback(context: AuthorizationContext, entryId: string, versionId: string) {
    requirePermission(context, PERMISSIONS.CONTENT_MANAGE);
    return this.store.rollbackToVersion(
      entryId,
      versionId,
      context.userId ?? null,
    );
  }

  async approveClient(context: AuthorizationContext, entryId: string) {
    requirePermission(context, PERMISSIONS.CONTENT_PUBLISH);
    const entry = await this.store.getEntryById(entryId);
    if (!entry) {
      return null;
    }
    if (!entry.requiresClientApproval) {
      throw AppError.badRequest('This entry does not require client approval');
    }
    if (entry.clientApprovedAt) {
      throw AppError.conflict('Client approval has already been recorded');
    }
    const [updated] = await this.store.approveClientEntry(
      entryId,
      context.userId ?? null,
    );
    return updated ?? null;
  }

  async schedule(
    context: AuthorizationContext,
    entryId: string,
    input: { scheduledAt: Date; reviewDueAt?: Date | null },
  ) {
    requirePermission(context, PERMISSIONS.CONTENT_PUBLISH);
    const entry = await this.store.getEntryById(entryId);
    if (!entry) {
      return null;
    }
    if (input.scheduledAt.getTime() <= Date.now()) {
      throw AppError.badRequest('Scheduled publish time must be in the future');
    }
    const [updated] = await this.store.scheduleEntry(
      entryId,
      input.scheduledAt,
      context.userId ?? null,
    );
    if (!updated) {
      return null;
    }
    if (input.reviewDueAt !== undefined) {
      await this.store.setReviewDueAt(
        entryId,
        input.reviewDueAt,
        context.userId ?? null,
      );
    }
    return this.store.getEntryById(entryId);
  }

  listDueScheduledEntries(context: AuthorizationContext, asOf = new Date()) {
    requirePermission(context, PERMISSIONS.CONTENT_PUBLISH);
    return this.store.listDueScheduledEntries(asOf);
  }

  listDueReviewEntries(context: AuthorizationContext, asOf = new Date()) {
    requirePermission(context, PERMISSIONS.CONTENT_READ);
    return this.store.listDueReviewEntries(asOf);
  }

  async assertPathAvailable(path: string, locale = 'en-GB') {
    if (await this.pathExists(path, locale)) {
      throw AppError.conflict(`CMS entry already exists for path ${path}`);
    }
  }

  pathExists(path: string, locale = 'en-GB') {
    return this.store.countEntriesByPath(path, locale).then(([row]) => (row?.total ?? 0) > 0);
  }

  private assertClientApproval(entry: {
    requiresClientApproval: boolean;
    clientApprovedAt: Date | null;
  }) {
    if (entry.requiresClientApproval && !entry.clientApprovedAt) {
      throw AppError.conflict('Client approval is required before publishing');
    }
  }
}
