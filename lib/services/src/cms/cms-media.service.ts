import { AppError } from '@workspace/platform/errors';
import type { StorageProvider } from '@workspace/platform/storage';
import type { CmsMediaRepository } from '@workspace/data/repositories/cms-media';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import type {
  CmsMediaAssetSummary,
  CmsSeoEntrySummary,
} from '@workspace/domain/cms';

function mapMedia(row: {
  id: string;
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  altText: string | null;
  caption: string | null;
  publicUrl: string;
  usageCount: number;
  createdAt: Date;
}): CmsMediaAssetSummary {
  return {
    id: row.id,
    key: row.key,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    altText: row.altText,
    caption: row.caption,
    publicUrl: row.publicUrl,
    usageCount: row.usageCount,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapSeo(row: {
  id: string;
  path: string;
  title: string;
  contentType: string;
  status: string;
  seo: unknown;
  publishedAt: Date | null;
}): CmsSeoEntrySummary {
  return {
    id: row.id,
    path: row.path,
    title: row.title,
    contentType: row.contentType as CmsSeoEntrySummary['contentType'],
    status: row.status as CmsSeoEntrySummary['status'],
    seo: (row.seo ?? {}) as Record<string, unknown>,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export class CmsMediaService {
  constructor(
    private readonly media: CmsMediaRepository,
    private readonly storage: StorageProvider,
    private readonly publicBaseUrl: string,
  ) {}

  async listMedia(context: AuthorizationContext): Promise<CmsMediaAssetSummary[]> {
    const rows = await this.media.list(context);
    return Promise.all(
      rows.map(async (row) => {
        const mapped = mapMedia(row);
        if (this.storage.name === 's3') {
          return {
            ...mapped,
            publicUrl: await this.resolvePublicUrl(row.storageKey),
          };
        }
        return mapped;
      }),
    );
  }

  async uploadMedia(
    context: AuthorizationContext,
    input: {
      key: string;
      filename: string;
      mimeType: string;
      dataBase64: string;
      altText?: string | null;
      caption?: string | null;
    },
  ): Promise<CmsMediaAssetSummary> {
    const body = Buffer.from(input.dataBase64, 'base64');
    if (body.byteLength === 0) {
      throw AppError.badRequest('Media payload is empty');
    }

    const storageKey = `cms/media/${input.key}`;
    await this.storage.put({
      key: storageKey,
      body: new Uint8Array(body),
      contentType: input.mimeType,
    });

    const publicUrl = await this.resolvePublicUrl(storageKey);
    const row = await this.media.create(context, {
      key: input.key,
      filename: input.filename,
      mimeType: input.mimeType,
      sizeBytes: body.byteLength,
      storageKey,
      publicUrl,
      altText: input.altText ?? null,
      caption: input.caption ?? null,
    });

    if (!row) {
      throw AppError.internal('Failed to persist media asset');
    }

    return mapMedia(row);
  }

  async listSeoEntries(context: AuthorizationContext): Promise<CmsSeoEntrySummary[]> {
    const rows = await this.media.listSeoEntries(context);
    return rows.map(mapSeo);
  }

  async updateSeo(
    context: AuthorizationContext,
    entryId: string,
    seo: Record<string, unknown>,
  ): Promise<CmsSeoEntrySummary | null> {
    const row = await this.media.updateSeo(context, entryId, seo);
    return row ? mapSeo(row) : null;
  }

  private async resolvePublicUrl(storageKey: string): Promise<string> {
    if (this.storage.name === 's3') {
      return this.storage.signedReadUrl({
        key: storageKey,
        expiresInSeconds: 3600,
      });
    }
    return `${this.publicBaseUrl.replace(/\/$/, '')}/${storageKey}`;
  }
}

export function createCmsMediaService(deps: {
  media: CmsMediaRepository;
  storage: StorageProvider;
  publicBaseUrl?: string;
}) {
  return new CmsMediaService(
    deps.media,
    deps.storage,
    deps.publicBaseUrl ?? 'http://127.0.0.1:8787/storage',
  );
}
