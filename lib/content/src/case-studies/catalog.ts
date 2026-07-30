import type {
  CaseStudyCatalogItem,
  CaseStudyIndustryId,
  CaseStudyPageContent,
  CaseStudiesHubPageContent,
  ProjectTypeId,
  SuccessMetricType,
} from '../schemas/case-studies.js';
import type { ServicePageContent } from '../schemas/services.js';
import type { CoursePageContent } from '../schemas/training.js';
import type { ResourcePageContent } from '../schemas/resources.js';

export interface CaseStudyFilterOptions {
  industry?: CaseStudyIndustryId | 'all';
  service?: string | 'all';
  projectType?: ProjectTypeId | 'all';
  result?: SuccessMetricType | 'all';
  query?: string;
  featuredOnly?: boolean;
}

export function toCaseStudyCatalogItem(
  page: CaseStudyPageContent,
): CaseStudyCatalogItem {
  const yearMatch = page.publishDate.match(/\d{4}/);
  return {
    industry: page.industry,
    slug: page.slug,
    icon: page.icon,
    title: page.title,
    summary: page.overview,
    clientProfile: page.clientProfile,
    projectType: page.projectType,
    featured: page.featured,
    metricTypes: page.outcomeMetrics.map((m) => m.type),
    serviceCategories: page.servicesDelivered.map((s) => s.category),
    publishYear: yearMatch ? parseInt(yearMatch[0]!, 10) : 2024,
  };
}

export function filterCaseStudyCatalog(
  catalog: CaseStudyCatalogItem[],
  options: CaseStudyFilterOptions,
): CaseStudyCatalogItem[] {
  let results = [...catalog];

  if (options.industry && options.industry !== 'all') {
    results = results.filter((item) => item.industry === options.industry);
  }

  if (options.service && options.service !== 'all') {
    results = results.filter((item) =>
      item.serviceCategories.includes(options.service as string),
    );
  }

  if (options.projectType && options.projectType !== 'all') {
    results = results.filter(
      (item) => item.projectType === options.projectType,
    );
  }

  if (options.result && options.result !== 'all') {
    results = results.filter((item) =>
      item.metricTypes.includes(options.result as SuccessMetricType),
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
        item.clientProfile.toLowerCase().includes(q),
    );
  }

  return results.sort((a, b) => b.publishYear - a.publishYear);
}

export function parseCaseStudyPath(path: string): {
  industry: CaseStudyIndustryId;
  slug: string;
} | null {
  const match = path.match(/^\/case-studies\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  return { industry: match[1] as CaseStudyIndustryId, slug: match[2]! };
}

export function resolveRelatedCaseStudies(
  pages: CaseStudyPageContent[],
  refs: NonNullable<CaseStudyPageContent['relatedCaseStudies']>,
): CaseStudyPageContent[] {
  return refs
    .map((ref) =>
      pages.find((p) => p.industry === ref.industry && p.slug === ref.slug),
    )
    .filter((p): p is CaseStudyPageContent => p !== undefined);
}

export function resolveHubCaseStudies(
  pages: CaseStudyPageContent[],
  refs: CaseStudiesHubPageContent['featuredCaseStudies'],
): CaseStudyPageContent[] {
  return refs
    .map((ref) =>
      pages.find((p) => p.industry === ref.industry && p.slug === ref.slug),
    )
    .filter((p): p is CaseStudyPageContent => p !== undefined);
}

export function resolveCaseStudyServices(
  servicePages: ServicePageContent[],
  refs: CaseStudyPageContent['relatedServices'],
): ServicePageContent[] {
  return refs
    .map((ref) =>
      servicePages.find(
        (p) => p.category === ref.category && p.slug === ref.slug,
      ),
    )
    .filter((p): p is ServicePageContent => p !== undefined);
}

export function resolveCaseStudyCourses(
  coursePages: CoursePageContent[],
  refs: NonNullable<CaseStudyPageContent['trainingDelivered']>,
): CoursePageContent[] {
  return refs
    .map((ref) =>
      coursePages.find(
        (p) => p.category === ref.category && p.slug === ref.slug,
      ),
    )
    .filter((p): p is CoursePageContent => p !== undefined);
}

export function resolveCaseStudyResources(
  resourcePages: ResourcePageContent[],
  refs: NonNullable<CaseStudyPageContent['relatedResources']>,
): ResourcePageContent[] {
  return refs
    .map((ref) =>
      resourcePages.find((p) => p.type === ref.type && p.slug === ref.slug),
    )
    .filter((p): p is ResourcePageContent => p !== undefined);
}
