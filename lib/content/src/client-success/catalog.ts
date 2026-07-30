import type {
  ClientSuccessCatalogItem,
  ClientSuccessPageContent,
  ClientSuccessHubPageContent,
} from '../schemas/client-success.js';

export interface ClientSuccessFilterOptions {
  industry?: string | 'all';
  query?: string;
  featuredOnly?: boolean;
}

export function toClientSuccessCatalogItem(
  page: ClientSuccessPageContent,
): ClientSuccessCatalogItem {
  return {
    slug: page.slug,
    title: page.title,
    summary: page.overview,
    industry: page.relatedCaseStudies?.[0]?.industry ?? 'construction',
    featured: page.featured,
    metricTypes: page.outcomeMetrics.map((m) => m.type),
  };
}

export function filterClientSuccessCatalog(
  catalog: ClientSuccessCatalogItem[],
  options: ClientSuccessFilterOptions,
): ClientSuccessCatalogItem[] {
  let results = [...catalog];

  if (options.industry && options.industry !== 'all') {
    results = results.filter((item) => item.industry === options.industry);
  }

  if (options.featuredOnly) {
    results = results.filter((item) => item.featured);
  }

  if (options.query?.trim()) {
    const q = options.query.trim().toLowerCase();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q),
    );
  }

  return results;
}

export function parseClientSuccessPath(path: string): { slug: string } | null {
  const match = path.match(/^\/client-success\/([^/]+)$/);
  if (!match) return null;
  return { slug: match[1]! };
}

export function resolveHubClientSuccessStories(
  pages: ClientSuccessPageContent[],
  refs: ClientSuccessHubPageContent['featuredStories'],
): ClientSuccessPageContent[] {
  return refs
    .map((slug) => pages.find((p) => p.slug === slug))
    .filter((p): p is ClientSuccessPageContent => p !== undefined);
}
