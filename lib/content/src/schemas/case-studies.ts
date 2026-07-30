import { z } from 'zod';
import {
  breadcrumbItemSchema,
  iconNameSchema,
  pageHeroSchema,
  seoFieldsSchema,
  slugSchema,
  simpleStatSchema,
} from './base.js';
import { ctaBlockSchema, timelineItemSchema } from './corporate.js';
import {
  faqItemSchema,
  serviceIndustryRefSchema,
  serviceRelationRefSchema,
  serviceTrainingRefSchema,
} from './services.js';
import { courseRelationRefSchema } from './training.js';
import { resourceRelationRefSchema } from './resources.js';

/** Industry slugs aligned with the Industries platform. */
export const caseStudyIndustryIdSchema = z.enum([
  'construction',
  'manufacturing',
  'healthcare',
  'oil-gas',
  'logistics',
  'retail',
  'education',
  'public-sector',
]);

export type CaseStudyIndustryId = z.infer<typeof caseStudyIndustryIdSchema>;

export const CASE_STUDY_INDUSTRY_LABELS: Record<CaseStudyIndustryId, string> =
  {
    construction: 'Construction',
    manufacturing: 'Manufacturing',
    healthcare: 'Healthcare',
    'oil-gas': 'Oil & Gas',
    logistics: 'Logistics & Transport',
    retail: 'Retail & Commercial',
    education: 'Education',
    'public-sector': 'Public Sector',
  };

export const projectTypeIdSchema = z.enum([
  'compliance-programme',
  'certification',
  'audit-support',
  'training-delivery',
  'system-implementation',
  'regulatory-response',
  'transformation',
]);

export type ProjectTypeId = z.infer<typeof projectTypeIdSchema>;

export const PROJECT_TYPE_LABELS: Record<ProjectTypeId, string> = {
  'compliance-programme': 'Compliance Programme',
  certification: 'Certification',
  'audit-support': 'Audit Support',
  'training-delivery': 'Training Delivery',
  'system-implementation': 'System Implementation',
  'regulatory-response': 'Regulatory Response',
  transformation: 'Transformation',
};

export const successMetricTypeSchema = z.enum([
  'incident-reduction',
  'audit-improvement',
  'compliance-score',
  'lti-reduction',
  'training-completion',
  'certification-achievement',
  'cost-savings',
  'operational-efficiency',
  'environmental-improvement',
  'employee-engagement',
]);

export type SuccessMetricType = z.infer<typeof successMetricTypeSchema>;

export const SUCCESS_METRIC_LABELS: Record<SuccessMetricType, string> = {
  'incident-reduction': 'Incident Reduction',
  'audit-improvement': 'Audit Improvement',
  'compliance-score': 'Compliance Score',
  'lti-reduction': 'Lost Time Injury Reduction',
  'training-completion': 'Training Completion',
  'certification-achievement': 'Certification Achievement',
  'cost-savings': 'Cost Savings',
  'operational-efficiency': 'Operational Efficiency',
  'environmental-improvement': 'Environmental Improvement',
  'employee-engagement': 'Employee Engagement',
};

export const successMetricSchema = z.object({
  type: successMetricTypeSchema,
  label: z.string().min(1),
  value: z.string().min(1),
  description: z.string().min(1).optional(),
  before: z.string().min(1).optional(),
  after: z.string().min(1).optional(),
});

export type SuccessMetric = z.infer<typeof successMetricSchema>;

export const conversionActionSchema = z.enum([
  'book-consultation',
  'request-proposal',
  'request-audit',
  'speak-with-consultant',
  'download-summary',
  'training-enquiry',
  'compliance-review',
]);

export type ConversionAction = z.infer<typeof conversionActionSchema>;

export const conversionCtaSchema = ctaBlockSchema.extend({
  action: conversionActionSchema,
});

export const caseStudyRelationRefSchema = z.object({
  industry: caseStudyIndustryIdSchema,
  slug: slugSchema,
});

export type CaseStudyRelationRef = z.infer<typeof caseStudyRelationRefSchema>;

export const clientQuoteSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
});

export const projectPhaseSchema = z.object({
  phase: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().min(1).optional(),
});

export const downloadableSummarySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  fileType: z.enum(['pdf']),
  url: z.string().min(1),
  size: z.string().min(1).optional(),
});

export const caseStudyCatalogItemSchema = z.object({
  industry: caseStudyIndustryIdSchema,
  slug: slugSchema,
  icon: iconNameSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  clientProfile: z.string().min(1),
  projectType: projectTypeIdSchema,
  featured: z.boolean().optional(),
  metricTypes: z.array(successMetricTypeSchema),
  serviceCategories: z.array(slugSchema),
  publishYear: z.number().int(),
});

export type CaseStudyCatalogItem = z.infer<typeof caseStudyCatalogItemSchema>;

export const caseStudyPageSchema = z.object({
  slug: slugSchema,
  industry: caseStudyIndustryIdSchema,
  path: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  icon: iconNameSchema,
  overview: z.string().min(1),
  clientProfile: z.string().min(1),
  clientSector: z.string().min(1),
  projectType: projectTypeIdSchema,
  challenge: z.string().min(1),
  objectives: z.array(z.string().min(1)),
  methodology: z.array(z.string().min(1)),
  servicesDelivered: z.array(serviceRelationRefSchema),
  trainingDelivered: z.array(courseRelationRefSchema).optional(),
  regulatoryFramework: z.array(z.string().min(1)),
  timeline: z.string().min(1),
  projectPhases: z.array(projectPhaseSchema),
  riskProfile: z.string().min(1),
  complianceJourney: z.array(z.string().min(1)),
  deliverables: z.array(z.string().min(1)),
  measurableResults: z.array(z.string().min(1)),
  outcomeMetrics: z.array(successMetricSchema),
  keyStatistics: z.array(simpleStatSchema),
  clientQuote: clientQuoteSchema.optional(),
  testimonialReference: slugSchema.optional(),
  gallery: z.array(z.string().min(1)).optional(),
  downloadableSummary: downloadableSummarySchema.optional(),
  relatedServices: z.array(serviceRelationRefSchema),
  relatedIndustries: z.array(serviceIndustryRefSchema),
  relatedTraining: z.array(serviceTrainingRefSchema).optional(),
  relatedResources: z.array(resourceRelationRefSchema).optional(),
  relatedCaseStudies: z.array(caseStudyRelationRefSchema).optional(),
  faqs: z.array(faqItemSchema),
  cta: conversionCtaSchema,
  seo: seoFieldsSchema,
  breadcrumbs: z.array(breadcrumbItemSchema),
  keywords: z.array(z.string().min(1)).optional(),
  featured: z.boolean().optional(),
  publishDate: z.string().min(1),
});

export type CaseStudyPageContent = z.infer<typeof caseStudyPageSchema>;

export const clientLogoSchema = z.object({
  name: z.string().min(1),
  industry: slugSchema.optional(),
});

export const awardSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().min(1),
  year: z.string().min(1),
  description: z.string().min(1).optional(),
});

export type ClientLogo = z.infer<typeof clientLogoSchema>;
export type Award = z.infer<typeof awardSchema>;

export const caseStudiesHubPageSchema = z.object({
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  industryFilters: z.array(
    z.object({ id: caseStudyIndustryIdSchema, label: z.string().min(1) }),
  ),
  serviceFilters: z.array(
    z.object({ id: slugSchema, label: z.string().min(1) }),
  ),
  projectTypeFilters: z.array(
    z.object({ id: projectTypeIdSchema, label: z.string().min(1) }),
  ),
  resultFilters: z.array(
    z.object({ id: successMetricTypeSchema, label: z.string().min(1) }),
  ),
  featuredCaseStudies: z.array(caseStudyRelationRefSchema),
  featuredSuccessStories: z.array(slugSchema),
  aggregateMetrics: z.array(successMetricSchema),
  industryStatistics: z.array(simpleStatSchema),
  clientLogos: z.array(clientLogoSchema),
  awards: z.array(awardSchema),
  successTimeline: z.array(timelineItemSchema),
  relatedResources: z.array(resourceRelationRefSchema),
  faqs: z.array(faqItemSchema),
  consultationCta: conversionCtaSchema,
});

export type CaseStudiesHubPageContent = z.infer<
  typeof caseStudiesHubPageSchema
>;

export function buildCaseStudyPath(
  industry: CaseStudyIndustryId,
  slug: string,
): string {
  return `/case-studies/${industry}/${slug}`;
}

export function buildCaseStudyHref(
  industry: CaseStudyIndustryId,
  slug: string,
): string {
  return buildCaseStudyPath(industry, slug);
}
