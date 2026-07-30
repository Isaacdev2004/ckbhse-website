import { z } from 'zod';
import {
  breadcrumbItemSchema,
  iconNameSchema,
  pageHeroSchema,
  seoFieldsSchema,
  slugSchema,
  statItemSchema,
} from './base.js';
import { ctaBlockSchema } from './corporate.js';
import {
  faqItemSchema,
  processStepSchema,
  serviceCaseStudyRefSchema,
  serviceRelationRefSchema,
  serviceTrainingRefSchema,
  serviceTestimonialSchema,
} from './services.js';

export const industrySectorIdSchema = z.enum([
  'built-environment',
  'industrial-energy',
  'transport-logistics',
  'healthcare-life-sciences',
  'education-public',
  'commercial',
]);

export type IndustrySectorId = z.infer<typeof industrySectorIdSchema>;

export const INDUSTRY_SECTOR_LABELS: Record<IndustrySectorId, string> = {
  'built-environment': 'Built Environment',
  'industrial-energy': 'Industrial & Energy',
  'transport-logistics': 'Transport & Logistics',
  'healthcare-life-sciences': 'Healthcare & Life Sciences',
  'education-public': 'Education & Public Sector',
  commercial: 'Commercial & Retail',
};

export const industrySectorSchema = z.object({
  id: industrySectorIdSchema,
  label: z.string().min(1),
});

export const regulatoryItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export const riskItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(['high', 'medium', 'low']).optional(),
});

export const resourceRefSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  href: z.string().min(1),
  available: z.boolean().optional(),
});

export const industryCatalogItemSchema = z.object({
  slug: slugSchema,
  sector: industrySectorIdSchema,
  icon: iconNameSchema,
  name: z.string().min(1),
  summary: z.string().min(1),
  topics: z.array(z.string().min(1)),
  regulatoryThemes: z.array(z.string().min(1)).optional(),
  featured: z.boolean().optional(),
  keywords: z.array(z.string().min(1)).optional(),
});

export type IndustryCatalogItem = z.infer<typeof industryCatalogItemSchema>;

export const industryPageSchema = z.object({
  slug: slugSchema,
  sector: industrySectorIdSchema,
  path: z.string().min(1),
  icon: iconNameSchema,
  name: z.string().min(1),
  hero: pageHeroSchema,
  overview: z.array(z.string().min(1)),
  topics: z.array(z.string().min(1)),
  challenges: z.array(z.string().min(1)),
  regulatoryFramework: z.array(regulatoryItemSchema),
  commonRisks: z.array(riskItemSchema),
  complianceRequirements: z.array(z.string().min(1)),
  requiredDocumentation: z.array(z.string().min(1)),
  applicableServices: z.array(serviceRelationRefSchema),
  recommendedTraining: z.array(serviceTrainingRefSchema),
  relevantCaseStudies: z.array(serviceCaseStudyRefSchema).optional(),
  downloadableResources: z.array(resourceRefSchema).optional(),
  standards: z.array(z.string().min(1)),
  methodology: z.array(processStepSchema),
  industryStatistics: z.array(statItemSchema).optional(),
  faqs: z.array(faqItemSchema),
  testimonial: serviceTestimonialSchema.optional(),
  cta: ctaBlockSchema,
  seo: seoFieldsSchema,
  breadcrumbs: z.array(breadcrumbItemSchema),
  keywords: z.array(z.string().min(1)).optional(),
  featured: z.boolean().optional(),
});

export type IndustryPageContent = z.infer<typeof industryPageSchema>;

export const clientJourneyStepSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const industriesHubPageSchema = z.object({
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  sectors: z.array(industrySectorSchema),
  regulatoryThemes: z.array(
    z.object({
      id: slugSchema,
      label: z.string().min(1),
    }),
  ),
  featuredIndustries: z.array(slugSchema),
  overview: z.object({
    title: z.string().min(1),
    paragraphs: z.array(z.string().min(1)),
  }),
  regulatoryLandscape: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(regulatoryItemSchema),
  }),
  industryStatistics: z.array(statItemSchema),
  clientJourney: z.object({
    title: z.string().min(1),
    steps: z.array(clientJourneyStepSchema),
  }),
  featuredCaseStudies: z.array(serviceCaseStudyRefSchema),
  relatedResources: z.array(resourceRefSchema),
  faqs: z.array(faqItemSchema),
  cta: ctaBlockSchema,
});

export type IndustriesHubPageContent = z.infer<typeof industriesHubPageSchema>;

export const industriesPageSchema = industriesHubPageSchema;
export type IndustriesPageContent = IndustriesHubPageContent;

export function buildIndustryPath(slug: string): string {
  return `/industries/${slug}`;
}
