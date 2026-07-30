import type {
  ResourceCatalogItem,
  ResourcePageContent,
  ResourceTypeId,
  ResourcesHubPageContent,
} from '../schemas/resources.js';
import type { ServicePageContent } from '../schemas/services.js';
import type { CoursePageContent } from '../schemas/training.js';

export interface ResourceFilterOptions {
  type?: ResourceTypeId | 'all';
  topic?: string | 'all';
  industry?: string | 'all';
  service?: string | 'all';
  training?: string | 'all';
  author?: string | 'all';
  year?: number | 'all';
  readingTime?: string | 'all';
  downloadableOnly?: boolean;
  query?: string;
  featuredOnly?: boolean;
}

export function toResourceCatalogItem(
  page: ResourcePageContent,
): ResourceCatalogItem {
  const yearMatch = page.publishDate.match(/\d{4}/);
  return {
    type: page.type,
    slug: page.slug,
    icon: page.icon,
    title: page.title,
    summary: page.summary,
    author: page.author,
    publishDate: page.publishDate,
    publishYear: yearMatch ? parseInt(yearMatch[0]!, 10) : 2024,
    readingTime: page.readingTime,
    tags: page.tags,
    industries: page.industries.map((i) => i.slug),
    topicTags: page.tags,
    featured: page.featured,
    downloadable: (page.downloadableFiles?.length ?? 0) > 0,
    keywords: page.keywords,
  };
}

function matchesReadingTime(readingTime: string, filter: string): boolean {
  const mins = parseInt(readingTime, 10);
  if (Number.isNaN(mins)) return true;
  switch (filter) {
    case 'short':
      return mins <= 5;
    case 'medium':
      return mins > 5 && mins <= 10;
    case 'long':
      return mins > 10;
    default:
      return true;
  }
}

export function filterResourceCatalog(
  catalog: ResourceCatalogItem[],
  options: ResourceFilterOptions,
): ResourceCatalogItem[] {
  let results = [...catalog];

  if (options.type && options.type !== 'all') {
    results = results.filter((item) => item.type === options.type);
  }

  if (options.topic && options.topic !== 'all') {
    results = results.filter(
      (item) =>
        item.tags.includes(options.topic as string) ||
        item.topicTags?.includes(options.topic as string),
    );
  }

  if (options.industry && options.industry !== 'all') {
    results = results.filter((item) =>
      item.industries.includes(options.industry as string),
    );
  }

  if (options.author && options.author !== 'all') {
    results = results.filter((item) =>
      item.author
        .toLowerCase()
        .includes((options.author as string).toLowerCase()),
    );
  }

  if (options.year && options.year !== 'all') {
    results = results.filter((item) => item.publishYear === options.year);
  }

  if (options.readingTime && options.readingTime !== 'all') {
    results = results.filter((item) =>
      matchesReadingTime(item.readingTime, options.readingTime as string),
    );
  }

  if (options.downloadableOnly) {
    results = results.filter((item) => item.downloadable);
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
        item.author.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.keywords?.some((k) => k.toLowerCase().includes(q)),
    );
  }

  return results.sort(
    (a, b) => b.publishYear - a.publishYear || a.title.localeCompare(b.title),
  );
}

export function parseResourcePath(
  path: string,
): { type: ResourceTypeId; slug: string } | null {
  const match = /^\/resources\/([^/]+)\/([^/]+)$/.exec(path);
  if (!match) return null;
  return { type: match[1] as ResourceTypeId, slug: match[2]! };
}

export function resolveRelatedResources(
  pages: ResourcePageContent[],
  refs: NonNullable<ResourcePageContent['relatedResources']>,
): ResourcePageContent[] {
  return refs
    .map((ref) => pages.find((p) => p.type === ref.type && p.slug === ref.slug))
    .filter((p): p is ResourcePageContent => p !== undefined);
}

export function resolveResourceServices(
  servicePages: ServicePageContent[],
  refs: ResourcePageContent['relatedServices'],
) {
  return refs
    .map((ref) =>
      servicePages.find(
        (p) => p.category === ref.category && p.slug === ref.slug,
      ),
    )
    .filter((p): p is ServicePageContent => p !== undefined);
}

export function resolveResourceCourses(
  coursePages: CoursePageContent[],
  refs: NonNullable<ResourcePageContent['relatedCourses']>,
) {
  return refs
    .map((ref) =>
      coursePages.find(
        (p) => p.category === ref.category && p.slug === ref.slug,
      ),
    )
    .filter((p): p is CoursePageContent => p !== undefined);
}

export function resolveHubResources(
  pages: ResourcePageContent[],
  refs: ResourcesHubPageContent['featuredResources'],
): ResourcePageContent[] {
  return refs
    .map((ref) => pages.find((p) => p.type === ref.type && p.slug === ref.slug))
    .filter((p): p is ResourcePageContent => p !== undefined);
}
