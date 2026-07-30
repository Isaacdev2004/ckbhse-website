import type {
  TestimonialCatalogItem,
  TestimonialCategory,
  TestimonialPageContent,
  TestimonialsHubPageContent,
} from '../schemas/testimonials.js';

export interface TestimonialFilterOptions {
  industry?: string | 'all';
  service?: string | 'all';
  company?: string | 'all';
  category?: TestimonialCategory | 'all';
  minRating?: number;
  query?: string;
  featuredOnly?: boolean;
}

export function toTestimonialCatalogItem(
  page: TestimonialPageContent,
): TestimonialCatalogItem {
  return {
    slug: page.slug,
    clientName: page.clientName,
    company: page.company,
    role: page.role,
    industry: page.industry.slug,
    serviceCategory: page.service?.category,
    rating: page.rating,
    featured: page.featured,
    category: page.category,
    date: page.date,
    location: page.location,
  };
}

export function filterTestimonialCatalog(
  catalog: TestimonialCatalogItem[],
  options: TestimonialFilterOptions,
): TestimonialCatalogItem[] {
  let results = [...catalog];

  if (options.industry && options.industry !== 'all') {
    results = results.filter((item) => item.industry === options.industry);
  }

  if (options.service && options.service !== 'all') {
    results = results.filter(
      (item) => item.serviceCategory === options.service,
    );
  }

  if (options.company && options.company !== 'all') {
    results = results.filter(
      (item) => item.company === options.company,
    );
  }

  if (options.category && options.category !== 'all') {
    results = results.filter((item) => item.category === options.category);
  }

  if (options.minRating) {
    results = results.filter((item) => item.rating >= options.minRating!);
  }

  if (options.featuredOnly) {
    results = results.filter((item) => item.featured);
  }

  if (options.query?.trim()) {
    const q = options.query.trim().toLowerCase();
    results = results.filter(
      (item) =>
        item.clientName.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q),
    );
  }

  return results;
}

export function parseTestimonialPath(path: string): { slug: string } | null {
  const match = path.match(/^\/testimonials\/([^/]+)$/);
  if (!match) return null;
  return { slug: match[1]! };
}

export function resolveHubTestimonials(
  pages: TestimonialPageContent[],
  refs: TestimonialsHubPageContent['featuredTestimonials'],
): TestimonialPageContent[] {
  return refs
    .map((slug) => pages.find((p) => p.slug === slug))
    .filter((p): p is TestimonialPageContent => p !== undefined);
}

export function resolveRelatedTestimonials(
  pages: TestimonialPageContent[],
  slugs: string[],
): TestimonialPageContent[] {
  return slugs
    .map((slug) => pages.find((p) => p.slug === slug))
    .filter((p): p is TestimonialPageContent => p !== undefined);
}
