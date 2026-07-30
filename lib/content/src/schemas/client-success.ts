import { z } from 'zod';
import {
  breadcrumbItemSchema,
  pageHeroSchema,
  seoFieldsSchema,
  slugSchema,
  simpleStatSchema,
} from './base.js';
import {
  awardSchema,
  clientLogoSchema,
  conversionCtaSchema,
  successMetricSchema,
} from './case-studies.js';
import { faqItemSchema } from './services.js';
import { timelineItemSchema } from './corporate.js';

export const beforeAfterComparisonSchema = z.object({
  title: z.string().min(1),
  before: z.string().min(1),
  after: z.string().min(1),
  metric: successMetricSchema.optional(),
});

export const clientJourneyStepSchema = z.object({
  step: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export type BeforeAfterComparison = z.infer<typeof beforeAfterComparisonSchema>;

export const clientSuccessCatalogItemSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  industry: slugSchema,
  featured: z.boolean().optional(),
  metricTypes: z.array(z.string().min(1)),
});

export type ClientSuccessCatalogItem = z.infer<
  typeof clientSuccessCatalogItemSchema
>;

export const clientSuccessPageSchema = z.object({
  slug: slugSchema,
  path: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  overview: z.string().min(1),
  statistics: z.array(simpleStatSchema),
  beforeAfter: z.array(beforeAfterComparisonSchema),
  outcomeMetrics: z.array(successMetricSchema),
  clientJourney: z.array(clientJourneyStepSchema),
  methodology: z.array(z.string().min(1)),
  improvementMetrics: z.array(successMetricSchema),
  riskReductionMetrics: z.array(successMetricSchema),
  complianceAchievements: z.array(z.string().min(1)),
  testimonialSlugs: z.array(slugSchema),
  awards: z.array(awardSchema).optional(),
  relatedCaseStudies: z.array(
    z.object({ industry: slugSchema, slug: slugSchema }),
  ).optional(),
  faqs: z.array(faqItemSchema),
  cta: conversionCtaSchema,
  seo: seoFieldsSchema,
  breadcrumbs: z.array(breadcrumbItemSchema),
  keywords: z.array(z.string().min(1)).optional(),
  featured: z.boolean().optional(),
});

export type ClientSuccessPageContent = z.infer<typeof clientSuccessPageSchema>;

export const clientSuccessHubPageSchema = z.object({
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  aggregateStatistics: z.array(simpleStatSchema),
  beforeAfterHighlights: z.array(beforeAfterComparisonSchema),
  outcomeDashboard: z.array(successMetricSchema),
  clientJourney: z.array(clientJourneyStepSchema),
  deliveryMethodology: z.array(z.string().min(1)),
  improvementMetrics: z.array(successMetricSchema),
  riskReductionMetrics: z.array(successMetricSchema),
  complianceAchievements: z.array(z.string().min(1)),
  featuredStories: z.array(slugSchema),
  featuredTestimonials: z.array(slugSchema),
  clientLogos: z.array(clientLogoSchema),
  awards: z.array(awardSchema),
  successTimeline: z.array(timelineItemSchema),
  faqs: z.array(faqItemSchema),
  consultationCta: conversionCtaSchema,
});

export type ClientSuccessHubPageContent = z.infer<
  typeof clientSuccessHubPageSchema
>;

export function buildClientSuccessPath(slug: string): string {
  return `/client-success/${slug}`;
}
