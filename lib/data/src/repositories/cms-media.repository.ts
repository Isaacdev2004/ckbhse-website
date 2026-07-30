import { AppError } from '@workspace/platform/errors';
import {
  requirePermission,
  type AuthorizationContext,
} from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import type { DrizzleCmsMediaStore } from '../stores/drizzle-cms-media.store.js';
import type { DrizzleCmsStore } from '../stores/drizzle-cms.store.js';

export class CmsMediaRepository {
  constructor(
    private readonly media: DrizzleCmsMediaStore,
    private readonly cms: DrizzleCmsStore,
  ) {}

  list(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.MEDIA_MANAGE);
    return this.media.list();
  }

  async get(context: AuthorizationContext, id: string) {
    requirePermission(context, PERMISSIONS.MEDIA_MANAGE);
    return this.media.getById(id);
  }

  async create(
    context: AuthorizationContext,
    input: {
      key: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
      storageKey: string;
      publicUrl: string;
      altText?: string | null;
      caption?: string | null;
    },
  ) {
    requirePermission(context, PERMISSIONS.MEDIA_MANAGE);
    const existing = await this.media.getByKey(input.key);
    if (existing) {
      throw AppError.conflict(`Media key already exists: ${input.key}`);
    }
    return this.media.create({
      ...input,
      createdBy: context.userId ?? null,
    });
  }

  listSeoEntries(context: AuthorizationContext) {
    requirePermission(context, PERMISSIONS.CONTENT_READ);
    return this.cms.listSeoSummaries();
  }

  async updateSeo(
    context: AuthorizationContext,
    entryId: string,
    seo: Record<string, unknown>,
  ) {
    requirePermission(context, PERMISSIONS.CONTENT_MANAGE);
    const [row] = await this.cms.updateEntrySeo(
      entryId,
      seo,
      context.userId ?? null,
    );
    return row ?? null;
  }
}
