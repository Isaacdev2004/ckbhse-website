import type { TestimonialPageContent } from '../../schemas/testimonials.js';
import { buildTestimonialPath } from '../../schemas/testimonials.js';
import type { CaseStudyRelationRef } from '../../schemas/case-studies.js';

type ServiceRef = NonNullable<TestimonialPageContent['relatedServices']>[number];

const INDUSTRY_NAMES: Record<string, string> = {
  construction: 'Construction',
  manufacturing: 'Manufacturing',
  healthcare: 'Healthcare',
  'oil-gas': 'Oil & Gas',
  logistics: 'Logistics & Transport',
  retail: 'Retail & Commercial',
  education: 'Education',
  'public-sector': 'Public Sector',
};

export interface DefineTestimonialInput {
  slug: string;
  clientName: string;
  company: string;
  role: string;
  industrySlug: string;
  service?: ServiceRef;
  projectReference?: CaseStudyRelationRef;
  testimonial: string;
  rating: number;
  category: TestimonialPageContent['category'];
  date: string;
  location?: string;
  featured?: boolean;
  relatedServices?: ServiceRef[];
  relatedIndustries?: string[];
  keywords?: string[];
}

export function defineTestimonial(
  input: DefineTestimonialInput,
): TestimonialPageContent {
  const path = buildTestimonialPath(input.slug);

  return {
    slug: input.slug,
    path,
    clientName: input.clientName,
    company: input.company,
    role: input.role,
    industry: {
      slug: input.industrySlug,
      name: INDUSTRY_NAMES[input.industrySlug] ?? input.industrySlug,
    },
    service: input.service,
    projectReference: input.projectReference,
    testimonial: input.testimonial,
    rating: input.rating,
    featured: input.featured,
    date: input.date,
    location: input.location,
    avatar: 'Users',
    category: input.category,
    relatedServices: input.relatedServices,
    relatedIndustries: input.relatedIndustries?.map((slug) => ({
      slug,
      name: INDUSTRY_NAMES[slug] ?? slug,
    })),
    seo: {
      title: `${input.clientName}, ${input.company} | CKBHSE Testimonial`,
      description: input.testimonial.slice(0, 160),
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: input.clientName, href: path },
    ],
    keywords: input.keywords,
  };
}

export function serviceRef(
  category: ServiceRef['category'],
  slug: string,
): ServiceRef {
  return { category, slug };
}

export function projectRef(
  industry: CaseStudyRelationRef['industry'],
  slug: string,
): CaseStudyRelationRef {
  return { industry, slug };
}
