import type {
  IndustryCatalogItem,
  IndustryPageContent,
  IndustrySectorId,
} from '../schemas/industries.js';
import type { ServicePageContent } from '../schemas/services.js';

export interface IndustryFilterOptions {
  sector?: IndustrySectorId | 'all';
  regulatoryTheme?: string | 'all';
  query?: string;
  featuredOnly?: boolean;
}

export function toIndustryCatalogItem(
  page: IndustryPageContent,
): IndustryCatalogItem {
  return {
    slug: page.slug,
    sector: page.sector,
    icon: page.icon,
    name: page.name,
    summary: page.hero.description,
    topics: page.topics,
    regulatoryThemes: inferRegulatoryThemes(page),
    featured: page.featured,
    keywords: page.keywords,
  };
}

function inferRegulatoryThemes(page: IndustryPageContent): string[] {
  const themes: string[] = [];
  const text = [
    ...page.topics,
    ...page.regulatoryFramework.map((r) => r.name),
    ...(page.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase();

  if (text.includes('cdm') || text.includes('construction')) themes.push('cdm');
  if (text.includes('iso')) themes.push('iso');
  if (text.includes('fire')) themes.push('fire');
  if (text.includes('environment') || text.includes('haccp'))
    themes.push('environmental');
  if (
    text.includes('health') ||
    text.includes('coshh') ||
    text.includes('occupational')
  )
    themes.push('occupational-health');
  if (
    text.includes('process') ||
    text.includes('comah') ||
    text.includes('major hazard')
  )
    themes.push('process-safety');

  return themes;
}

export function filterIndustryCatalog(
  catalog: IndustryCatalogItem[],
  options: IndustryFilterOptions,
): IndustryCatalogItem[] {
  let results = [...catalog];

  if (options.sector && options.sector !== 'all') {
    results = results.filter((item) => item.sector === options.sector);
  }

  if (options.regulatoryTheme && options.regulatoryTheme !== 'all') {
    results = results.filter((item) =>
      item.regulatoryThemes?.includes(options.regulatoryTheme as string),
    );
  }

  if (options.featuredOnly) {
    results = results.filter((item) => item.featured);
  }

  if (options.query?.trim()) {
    const q = options.query.trim().toLowerCase();
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.topics.some((t) => t.toLowerCase().includes(q)) ||
        item.keywords?.some((k) => k.toLowerCase().includes(q)),
    );
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

export function parseIndustryPath(path: string): { slug: string } | null {
  const match = /^\/industries\/([^/]+)$/.exec(path);
  if (!match) return null;
  return { slug: match[1]! };
}

export function resolveApplicableServices(
  servicePages: ServicePageContent[],
  refs: IndustryPageContent['applicableServices'],
) {
  return refs
    .map((ref) =>
      servicePages.find(
        (p) => p.category === ref.category && p.slug === ref.slug,
      ),
    )
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
}
