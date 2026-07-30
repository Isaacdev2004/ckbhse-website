import type { DrizzleCmsStore } from '../stores/drizzle-cms.store.js';

export class PublicContentRepository {
  constructor(private readonly store: DrizzleCmsStore) {}

  listPublished(locale?: string) {
    return this.store.listPublishedEntries(locale);
  }

  getPublishedByPath(path: string, locale?: string) {
    return this.store.getPublishedByPath(path, locale);
  }
}
