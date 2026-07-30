import { z } from 'zod';
import {
  breadcrumbItemSchema,
  iconNameSchema,
  pageHeroSchema,
  seoFieldsSchema,
  slugSchema,
} from './base.js';
import { ctaBlockSchema } from './corporate.js';
import {
  faqItemSchema,
  serviceCaseStudyRefSchema,
  serviceIndustryRefSchema,
  serviceRelationRefSchema,
  serviceTrainingRefSchema,
} from './services.js';
import { courseRelationRefSchema } from './training.js';

/** Route-level resource types — extend enum to add new types without redesign. */
export const resourceTypeIdSchema = z.enum([
  'articles',
  'guides',
  'templates',
  'checklists',
  'webinars',
  'news',
  'publications',
]);

export type ResourceTypeId = z.infer<typeof resourceTypeIdSchema>;

export const RESOURCE_TYPE_LABELS: Record<ResourceTypeId, string> = {
  articles: 'Articles',
  guides: 'Guides',
  templates: 'Templates',
  checklists: 'Checklists',
  webinars: 'Webinars',
  news: 'News & Updates',
  publications: 'Publications',
};

export const resourceTypeSchema = z.object({
  id: resourceTypeIdSchema,
  label: z.string().min(1),
  description: z.string().min(1),
});

export const contentBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: z.string().min(1) }),
  z.object({
    type: z.literal('heading'),
    level: z.enum(['2', '3']),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal('list'),
    items: z.array(z.string().min(1)),
    ordered: z.boolean().optional(),
  }),
]);

export type ContentBlock = z.infer<typeof contentBlockSchema>;

export const downloadableFileSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).optional(),
  fileType: z.enum(['pdf', 'docx', 'xlsx', 'zip']),
  url: z.string().min(1),
  size: z.string().min(1).optional(),
});

export type DownloadableFile = z.infer<typeof downloadableFileSchema>;

export const webinarDetailsSchema = z.object({
  status: z.enum(['upcoming', 'recorded', 'on-demand']),
  scheduledDate: z.string().min(1).optional(),
  duration: z.string().min(1).optional(),
  registrationUrl: z.string().min(1).optional(),
});

export const resourceRelationRefSchema = z.object({
  type: resourceTypeIdSchema,
  slug: slugSchema,
});

export type ResourceRelationRef = z.infer<typeof resourceRelationRefSchema>;

export const referenceSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1).optional(),
});

export const regulatoryUpdateTypeSchema = z.enum([
  'legislation',
  'hse-guidance',
  'iso-update',
  'best-practice',
]);

export const resourceCatalogItemSchema = z.object({
  type: resourceTypeIdSchema,
  slug: slugSchema,
  icon: iconNameSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  author: z.string().min(1),
  publishDate: z.string().min(1),
  publishYear: z.number().int(),
  readingTime: z.string().min(1),
  tags: z.array(z.string().min(1)),
  industries: z.array(slugSchema),
  topicTags: z.array(z.string().min(1)).optional(),
  featured: z.boolean().optional(),
  downloadable: z.boolean().optional(),
  keywords: z.array(z.string().min(1)).optional(),
});

export type ResourceCatalogItem = z.infer<typeof resourceCatalogItemSchema>;

export const resourcePageSchema = z.object({
  slug: slugSchema,
  type: resourceTypeIdSchema,
  path: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  icon: iconNameSchema,
  summary: z.string().min(1),
  author: z.string().min(1),
  publishDate: z.string().min(1),
  updatedDate: z.string().min(1),
  readingTime: z.string().min(1),
  featuredImage: z.string().min(1).optional(),
  body: z.array(contentBlockSchema),
  downloadableFiles: z.array(downloadableFileSchema).optional(),
  webinar: webinarDetailsSchema.optional(),
  regulatoryType: regulatoryUpdateTypeSchema.optional(),
  tags: z.array(z.string().min(1)),
  industries: z.array(serviceIndustryRefSchema),
  relatedServices: z.array(serviceRelationRefSchema),
  relatedTraining: z.array(serviceTrainingRefSchema).optional(),
  relatedCourses: z.array(courseRelationRefSchema).optional(),
  relatedResources: z.array(resourceRelationRefSchema).optional(),
  relatedCaseStudies: z.array(serviceCaseStudyRefSchema).optional(),
  references: z.array(referenceSchema).optional(),
  faqs: z.array(faqItemSchema),
  cta: ctaBlockSchema,
  seo: seoFieldsSchema,
  breadcrumbs: z.array(breadcrumbItemSchema),
  keywords: z.array(z.string().min(1)).optional(),
  featured: z.boolean().optional(),
});

export type ResourcePageContent = z.infer<typeof resourcePageSchema>;

export const trendingTopicSchema = z.object({
  label: z.string().min(1),
  tag: z.string().min(1),
});

export const resourcesHubPageSchema = z.object({
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  resourceTypes: z.array(resourceTypeSchema),
  topicFilters: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })),
  industryFilters: z.array(
    z.object({ id: slugSchema, label: z.string().min(1) }),
  ),
  authorFilters: z.array(
    z.object({ id: z.string().min(1), label: z.string().min(1) }),
  ),
  readingTimeFilters: z.array(
    z.object({ id: z.string().min(1), label: z.string().min(1) }),
  ),
  featuredResources: z.array(resourceRelationRefSchema),
  popularDownloads: z.array(resourceRelationRefSchema),
  trendingTopics: z.array(trendingTopicSchema),
  regulatoryUpdates: z.array(resourceRelationRefSchema),
  webinarSpotlight: z.array(resourceRelationRefSchema),
  overview: z.object({
    title: z.string().min(1),
    paragraphs: z.array(z.string().min(1)),
  }),
  newsletterCta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  downloadCentre: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  faqs: z.array(faqItemSchema),
  consultationCta: ctaBlockSchema,
});

export type ResourcesHubPageContent = z.infer<typeof resourcesHubPageSchema>;

/** Backward-compatible hub alias. */
export type KnowledgePageContent = ResourcesHubPageContent;

export function buildResourcePath(type: ResourceTypeId, slug: string): string {
  return `/resources/${type}/${slug}`;
}
