import { z } from 'zod';
import {
  breadcrumbItemSchema,
  iconNameSchema,
  pageHeroSchema,
  seoFieldsSchema,
  slugSchema,
} from './base.js';
import { ctaBlockSchema, featureItemSchema } from './corporate.js';

export const serviceCategoryIdSchema = z.enum([
  'health-safety',
  'environmental',
  'occupational-health',
  'iso-management',
  'compliance-regulatory',
  'business-risk',
]);

export type ServiceCategoryId = z.infer<typeof serviceCategoryIdSchema>;

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategoryId, string> = {
  'health-safety': 'Health & Safety Consultancy',
  environmental: 'Environmental Consultancy',
  'occupational-health': 'Occupational Health',
  'iso-management': 'ISO & Management Systems',
  'compliance-regulatory': 'Compliance & Regulatory Support',
  'business-risk': 'Business Risk & Consultancy',
};

export const serviceCategorySchema = z.object({
  id: serviceCategoryIdSchema,
  label: z.string().min(1),
  description: z.string().min(1),
});

export const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export type FaqItem = z.infer<typeof faqItemSchema>;

export const processStepSchema = z.object({
  step: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export type ProcessStep = z.infer<typeof processStepSchema>;

export const serviceIndustryRefSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
});

export const serviceRelationRefSchema = z.object({
  category: serviceCategoryIdSchema,
  slug: slugSchema,
});

export const serviceTrainingRefSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  href: z.string().min(1),
});

export const serviceCaseStudyRefSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  href: z.string().min(1),
});

export const serviceTestimonialSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().min(1),
});

export const serviceCatalogItemSchema = z.object({
  category: serviceCategoryIdSchema,
  slug: slugSchema,
  icon: iconNameSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  industries: z.array(slugSchema),
  featured: z.boolean().optional(),
  keywords: z.array(z.string().min(1)).optional(),
});

export type ServiceCatalogItem = z.infer<typeof serviceCatalogItemSchema>;

export const servicePageSchema = z.object({
  slug: slugSchema,
  category: serviceCategoryIdSchema,
  path: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  icon: iconNameSchema,
  hero: pageHeroSchema,
  summary: z.string().min(1),
  overview: z.array(z.string().min(1)),
  objectives: z.array(z.string().min(1)),
  keyBenefits: z.array(featureItemSchema),
  industries: z.array(serviceIndustryRefSchema),
  regulations: z.array(z.string().min(1)),
  methodology: z.array(processStepSchema),
  deliverables: z.array(z.string().min(1)),
  timeline: z.string().min(1),
  expectedResults: z.array(z.string().min(1)),
  faqs: z.array(faqItemSchema),
  relatedServices: z.array(serviceRelationRefSchema),
  relatedTraining: z.array(serviceTrainingRefSchema).optional(),
  relatedCaseStudies: z.array(serviceCaseStudyRefSchema).optional(),
  testimonial: serviceTestimonialSchema.optional(),
  cta: ctaBlockSchema,
  seo: seoFieldsSchema,
  breadcrumbs: z.array(breadcrumbItemSchema),
  keywords: z.array(z.string().min(1)).optional(),
  featured: z.boolean().optional(),
});

export type ServicePageContent = z.infer<typeof servicePageSchema>;

export const engagementStepSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const servicesHubPageSchema = z.object({
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  categories: z.array(serviceCategorySchema),
  industryFilters: z.array(
    z.object({
      id: slugSchema,
      label: z.string().min(1),
    }),
  ),
  featuredServices: z.array(serviceRelationRefSchema),
  overview: z.object({
    title: z.string().min(1),
    paragraphs: z.array(z.string().min(1)),
  }),
  whyChoose: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    items: z.array(featureItemSchema),
  }),
  methodology: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    steps: z.array(processStepSchema),
  }),
  engagementProcess: z.object({
    title: z.string().min(1),
    steps: z.array(engagementStepSchema),
  }),
  faqs: z.array(faqItemSchema),
  retainerCta: ctaBlockSchema,
});

export type ServicesHubPageContent = z.infer<typeof servicesHubPageSchema>;

/** Backward-compatible alias used by hub loader and tests. */
export const servicesPageSchema = servicesHubPageSchema;
export type ServicesPageContent = ServicesHubPageContent;

export function buildServicePath(
  category: ServiceCategoryId,
  slug: string,
): string {
  return `/services/${category}/${slug}`;
}
