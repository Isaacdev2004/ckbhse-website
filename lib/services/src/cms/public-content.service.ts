import type { PublicContentRepository } from '@workspace/data/repositories/public-content';
import { buildContentSnapshot } from '@workspace/content/snapshot';
import type { CmsContentSnapshot } from '@workspace/content/snapshot';
import type { PublicContentEntry } from '@workspace/domain/cms';

function mapRow(row: {
  path: string;
  contentType: string;
  slug: string;
  title: string;
  category: string | null;
  segment: string | null;
  seo: unknown;
  payload: unknown;
  publishedAt: Date | null;
}): PublicContentEntry {
  return {
    path: row.path,
    contentType: row.contentType as PublicContentEntry['contentType'],
    slug: row.slug,
    title: row.title,
    category: row.category,
    segment: row.segment,
    seo: (row.seo ?? {}) as Record<string, unknown>,
    payload: row.payload,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export class PublicContentService {
  constructor(private readonly content: PublicContentRepository) {}

  async listPublished(locale = 'en-GB'): Promise<PublicContentEntry[]> {
    const rows = await this.content.listPublished(locale);
    return rows.map(mapRow);
  }

  async getByPath(path: string, locale = 'en-GB'): Promise<PublicContentEntry | null> {
    const rows = await this.content.getPublishedByPath(path, locale);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async buildSnapshot(locale = 'en-GB'): Promise<CmsContentSnapshot> {
    const rows = await this.content.listPublished(locale);
    return buildContentSnapshot(rows, locale);
  }
}

export function createPublicContentService(deps: {
  content: PublicContentRepository;
}) {
  return new PublicContentService(deps.content);
}
