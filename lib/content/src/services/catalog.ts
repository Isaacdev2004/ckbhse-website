import type {
  ServiceCatalogItem,
  ServiceCategoryId,
  ServicePageContent,
} from '../schemas/services.js';

export interface ServiceFilterOptions {
  category?: ServiceCategoryId | 'all';
  industry?: string | 'all';
  query?: string;
  featuredOnly?: boolean;
}

export function toCatalogItem(page: ServicePageContent): ServiceCatalogItem {
  return {
    category: page.category,
    slug: page.slug,
    icon: page.icon,
    title: page.title,
    summary: page.summary,
    industries: page.industries.map((i) => i.slug),
    featured: page.featured,
    keywords: page.keywords,
  };
}

export function filterServiceCatalog(
  catalog: ServiceCatalogItem[],
  options: ServiceFilterOptions,
): ServiceCatalogItem[] {
  let results = [...catalog];

  if (options.category && options.category !== 'all') {
    results = results.filter((item) => item.category === options.category);
  }

  if (options.industry && options.industry !== 'all') {
    results = results.filter((item) =>
      item.industries.includes(options.industry as string),
    );
  }

  if (options.featuredOnly) {
    results = results.filter((item) => item.featured);
  }

  if (options.query?.trim()) {
    const q = options.query.trim().toLowerCase();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.toLowerCase().includes(q)),
    );
  }

  return results.sort((a, b) => a.title.localeCompare(b.title));
}

export function resolveRelatedServices(
  pages: ServicePageContent[],
  refs: ServicePageContent['relatedServices'],
): ServicePageContent[] {
  return refs
    .map((ref) =>
      pages.find((p) => p.category === ref.category && p.slug === ref.slug),
    )
    .filter((p): p is ServicePageContent => p !== undefined);
}

export function parseServicePath(path: string): {
  category: string;
  slug: string;
} | null {
  const match = /^\/services\/([^/]+)\/([^/]+)$/.exec(path);
  if (!match) return null;
  return { category: match[1]!, slug: match[2]! };
}
