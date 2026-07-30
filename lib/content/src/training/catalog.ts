import type {
  DeliveryMethodId,
  LearningPathway,
  PathwayLevelId,
  TrainingCatalogItem,
  TrainingCategoryId,
  CoursePageContent,
} from '../schemas/training.js';
import type { ServicePageContent } from '../schemas/services.js';

export interface TrainingFilterOptions {
  category?: TrainingCategoryId | 'all';
  deliveryMethod?: DeliveryMethodId | 'all';
  industry?: string | 'all';
  certification?: string | 'all';
  duration?: string | 'all';
  pathwayLevel?: PathwayLevelId | 'all';
  query?: string;
  featuredOnly?: boolean;
}

export function toTrainingCatalogItem(
  page: CoursePageContent,
): TrainingCatalogItem {
  return {
    category: page.category,
    slug: page.slug,
    icon: page.icon,
    title: page.title,
    summary: page.hero.description,
    accreditation: page.accreditation,
    level: page.level,
    duration: page.duration,
    deliveryMethods: page.deliveryMethods.map((d) => d.id),
    certification: page.certification.name,
    industries: page.industries.map((i) => i.slug),
    pathwayLevel: page.pathwayLevel,
    featured: page.featured,
    keywords: page.keywords,
  };
}

function matchesDuration(duration: string, filter: string): boolean {
  const lower = duration.toLowerCase();
  switch (filter) {
    case 'short':
      return (
        lower.includes('hour') ||
        lower.includes('half day') ||
        lower === '2 hours'
      );
    case 'medium':
      return (
        lower.includes('1 day') ||
        lower.includes('2 day') ||
        lower.includes('3 day') ||
        lower.includes('3–4') ||
        lower.includes('3-4')
      );
    case 'long':
      return (
        lower.includes('4 day') ||
        lower.includes('10 day') ||
        parseInt(lower, 10) >= 4
      );
    default:
      return true;
  }
}

function matchesCertification(accreditation: string, filter: string): boolean {
  const lower = accreditation.toLowerCase();
  switch (filter) {
    case 'iosh':
      return lower.includes('iosh');
    case 'nebosh':
      return lower.includes('nebosh');
    case 'cpd':
      return lower.includes('cpd');
    case 'hse':
      return lower.includes('hse');
    default:
      return true;
  }
}

export function filterTrainingCatalog(
  catalog: TrainingCatalogItem[],
  options: TrainingFilterOptions,
): TrainingCatalogItem[] {
  let results = [...catalog];

  if (options.category && options.category !== 'all') {
    results = results.filter((item) => item.category === options.category);
  }

  if (options.deliveryMethod && options.deliveryMethod !== 'all') {
    results = results.filter((item) =>
      item.deliveryMethods.includes(options.deliveryMethod as DeliveryMethodId),
    );
  }

  if (options.industry && options.industry !== 'all') {
    results = results.filter((item) =>
      item.industries.includes(options.industry as string),
    );
  }

  if (options.certification && options.certification !== 'all') {
    results = results.filter((item) =>
      matchesCertification(item.accreditation, options.certification as string),
    );
  }

  if (options.duration && options.duration !== 'all') {
    results = results.filter((item) =>
      matchesDuration(item.duration, options.duration as string),
    );
  }

  if (options.pathwayLevel && options.pathwayLevel !== 'all') {
    results = results.filter(
      (item) =>
        item.pathwayLevel === options.pathwayLevel ||
        item.level === options.pathwayLevel,
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
        item.accreditation.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.toLowerCase().includes(q)),
    );
  }

  return results.sort((a, b) => a.title.localeCompare(b.title));
}

export function parseTrainingPath(
  path: string,
): { category: TrainingCategoryId; slug: string } | null {
  const match = /^\/training\/([^/]+)\/([^/]+)$/.exec(path);
  if (!match) return null;
  return { category: match[1] as TrainingCategoryId, slug: match[2]! };
}

export function resolveRelatedCourses(
  pages: CoursePageContent[],
  refs: NonNullable<CoursePageContent['relatedCourses']>,
): CoursePageContent[] {
  return refs
    .map((ref) =>
      pages.find((p) => p.category === ref.category && p.slug === ref.slug),
    )
    .filter((p): p is CoursePageContent => p !== undefined);
}

export function resolveRelatedServicesForCourse(
  servicePages: ServicePageContent[],
  refs: CoursePageContent['relatedServices'],
) {
  return refs
    .map((ref) =>
      servicePages.find(
        (p) => p.category === ref.category && p.slug === ref.slug,
      ),
    )
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
}

export function resolveLearningPathway(
  pages: CoursePageContent[],
  pathway: LearningPathway,
): CoursePageContent[] {
  return pathway.courses
    .map((ref) =>
      pages.find((p) => p.category === ref.category && p.slug === ref.slug),
    )
    .filter((p): p is CoursePageContent => p !== undefined);
}
