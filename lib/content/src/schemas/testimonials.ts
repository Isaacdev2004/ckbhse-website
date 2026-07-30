import { z } from 'zod';
import {
  breadcrumbItemSchema,
  iconNameSchema,
  pageHeroSchema,
  seoFieldsSchema,
  slugSchema,
} from './base.js';
import { conversionCtaSchema } from './case-studies.js';
import {
  faqItemSchema,
  serviceIndustryRefSchema,
  serviceRelationRefSchema,
} from './services.js';
import { caseStudyRelationRefSchema } from './case-studies.js';

export const testimonialCategorySchema = z.enum([
  'safety-culture',
  'compliance',
  'training',
  'certification',
  'transformation',
  'partnership',
]);

export type TestimonialCategory = z.infer<typeof testimonialCategorySchema>;

export const TESTIMONIAL_CATEGORY_LABELS: Record<TestimonialCategory, string> =
  {
    'safety-culture': 'Safety Culture',
    compliance: 'Compliance',
    training: 'Training',
    certification: 'Certification',
    transformation: 'Transformation',
    partnership: 'Long-term Partnership',
  };

export const testimonialCatalogItemSchema = z.object({
  slug: slugSchema,
  clientName: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  industry: slugSchema,
  serviceCategory: slugSchema.optional(),
  rating: z.number().min(1).max(5),
  featured: z.boolean().optional(),
  category: testimonialCategorySchema,
  date: z.string().min(1),
  location: z.string().min(1).optional(),
});

export type TestimonialCatalogItem = z.infer<
  typeof testimonialCatalogItemSchema
>;

export const testimonialPageSchema = z.object({
  slug: slugSchema,
  path: z.string().min(1),
  clientName: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  industry: serviceIndustryRefSchema,
  service: serviceRelationRefSchema.optional(),
  projectReference: caseStudyRelationRefSchema.optional(),
  testimonial: z.string().min(1),
  rating: z.number().min(1).max(5),
  featured: z.boolean().optional(),
  date: z.string().min(1),
  location: z.string().min(1).optional(),
  avatar: iconNameSchema.optional(),
  companyLogo: z.string().min(1).optional(),
  videoPlaceholder: z.boolean().optional(),
  category: testimonialCategorySchema,
  relatedServices: z.array(serviceRelationRefSchema).optional(),
  relatedIndustries: z.array(serviceIndustryRefSchema).optional(),
  seo: seoFieldsSchema,
  breadcrumbs: z.array(breadcrumbItemSchema),
  keywords: z.array(z.string().min(1)).optional(),
});

export type TestimonialPageContent = z.infer<typeof testimonialPageSchema>;

export const testimonialsHubPageSchema = z.object({
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  industryFilters: z.array(
    z.object({ id: slugSchema, label: z.string().min(1) }),
  ),
  serviceFilters: z.array(
    z.object({ id: slugSchema, label: z.string().min(1) }),
  ),
  companyFilters: z.array(
    z.object({ id: z.string().min(1), label: z.string().min(1) }),
  ),
  categoryFilters: z.array(
    z.object({ id: testimonialCategorySchema, label: z.string().min(1) }),
  ),
  featuredTestimonials: z.array(slugSchema),
  trustIndicators: z.array(z.string().min(1)),
  faqs: z.array(faqItemSchema),
  consultationCta: conversionCtaSchema,
});

export type TestimonialsHubPageContent = z.infer<
  typeof testimonialsHubPageSchema
>;

export function buildTestimonialPath(slug: string): string {
  return `/testimonials/${slug}`;
}
